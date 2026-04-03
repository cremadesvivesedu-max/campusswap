"use client";

import { useEffect, useState } from "react";
import { demoData } from "@/lib/demo-data";
import type { Conversation, Message, MessageAttachment } from "@/types/domain";

const conversationsStorageKey = "campusswap.demo.conversations";
const conversationsEvent = "campusswap:demo-conversations";

const defaultQuickActions = [
  "Is this available?",
  "Can you reserve it?",
  "Can we meet on campus?",
  "Is the price negotiable?"
];

type ConversationMap = Record<string, Conversation>;

function cloneConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    messages: conversation.messages.map((message) => ({ ...message })),
    quickActions: [...conversation.quickActions]
  };
}

function readStoredConversations(): ConversationMap {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(conversationsStorageKey);
  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ConversationMap;
  } catch {
    return {};
  }
}

function writeStoredConversations(value: ConversationMap) {
  window.localStorage.setItem(conversationsStorageKey, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(conversationsEvent));
}

function getMergedConversationMap() {
  const merged: ConversationMap = {};

  for (const conversation of demoData.conversations) {
    merged[conversation.id] = cloneConversation(conversation);
  }

  return {
    ...merged,
    ...readStoredConversations()
  };
}

function sortByLatestMessage(left: Conversation, right: Conversation) {
  const leftDate = Date.parse(left.messages[left.messages.length - 1]?.sentAt ?? demoData.listings.find((listing) => listing.id === left.listingId)?.createdAt ?? new Date(0).toISOString());
  const rightDate = Date.parse(right.messages[right.messages.length - 1]?.sentAt ?? demoData.listings.find((listing) => listing.id === right.listingId)?.createdAt ?? new Date(0).toISOString());
  return rightDate - leftDate;
}

function buildConversationId(listingId: string, buyerId: string, sellerId: string) {
  return `conv-${listingId}-${buyerId}-${sellerId}`;
}

export function getConversationById(conversationId: string) {
  return getMergedConversationMap()[conversationId];
}

export function getConversationByContext(listingId: string, buyerId: string, sellerId: string) {
  return Object.values(getMergedConversationMap()).find(
    (conversation) =>
      conversation.listingId === listingId &&
      conversation.buyerId === buyerId &&
      conversation.sellerId === sellerId
  );
}

export function getUserConversations(userId: string) {
  return Object.values(getMergedConversationMap())
    .filter((conversation) => conversation.buyerId === userId || conversation.sellerId === userId)
    .sort(sortByLatestMessage);
}

export async function ensureConversationForListing(listingId: string, buyerId: string, sellerId: string) {
  const existingConversation = getConversationByContext(listingId, buyerId, sellerId);
  if (existingConversation) {
    return existingConversation;
  }

  const newConversation: Conversation = {
    id: buildConversationId(listingId, buyerId, sellerId),
    listingId,
    buyerId,
    sellerId,
    unreadCount: 0,
    quickActions: defaultQuickActions,
    messages: []
  };

  const storedConversations = readStoredConversations();
  storedConversations[newConversation.id] = newConversation;
  writeStoredConversations(storedConversations);

  return newConversation;
}

export async function sendConversationMessage(
  conversationId: string,
  senderId: string,
  text: string,
  attachment?: MessageAttachment
) {
  const mergedConversation = getConversationById(conversationId);
  if (!mergedConversation) {
    throw new Error("Conversation not found.");
  }

  const storedConversations = readStoredConversations();
  const writableConversation = cloneConversation(storedConversations[conversationId] ?? mergedConversation);
  const nextMessage: Message = {
    id: `msg-${conversationId}-${Date.now()}`,
    conversationId,
    senderId,
    text,
    sentAt: new Date().toISOString(),
    read: true,
    attachment
  };

  writableConversation.messages = [...writableConversation.messages, nextMessage];
  writableConversation.unreadCount = 0;
  storedConversations[conversationId] = writableConversation;
  writeStoredConversations(storedConversations);

  return writableConversation;
}

export async function createAttachmentFromFile(file: File): Promise<MessageAttachment> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Attachment upload failed."));
    reader.readAsDataURL(file);
  });

  return {
    id: `attachment-${Date.now()}`,
    url,
    name: file.name,
    mimeType: file.type
  };
}

export function useDemoConversations(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const sync = () => {
      setConversations(getUserConversations(userId));
    };

    sync();
    window.addEventListener(conversationsEvent, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(conversationsEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);

  return conversations;
}

export function useDemoConversation(conversationId: string) {
  const [conversation, setConversation] = useState<Conversation | undefined>(() =>
    getConversationById(conversationId)
  );

  useEffect(() => {
    const sync = () => {
      setConversation(getConversationById(conversationId));
    };

    sync();
    window.addEventListener(conversationsEvent, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(conversationsEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, [conversationId]);

  return conversation;
}
