"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, RotateCcw } from "lucide-react";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  clearProfileAvatarAction,
  updateProfileAvatarAction
} from "@/server/actions/forms";
import type { User } from "@/types/domain";

interface ProfileAvatarFormProps {
  user: User;
}

export function ProfileAvatarForm({ user }: ProfileAvatarFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadAction] = useActionState(updateProfileAvatarAction, {
    success: false,
    message: ""
  });
  const [resetState, resetAction] = useActionState(clearProfileAvatarAction, {
    success: false,
    message: ""
  });

  useEffect(() => {
    if (uploadState.success || resetState.success) {
      router.refresh();
    }
  }, [resetState.success, router, uploadState.success]);

  return (
    <Card className="bg-white">
      <CardHeader className="space-y-3">
        <p className="font-display text-2xl font-semibold text-slate-950">
          Profile photo
        </p>
        <p className="text-sm leading-6 text-slate-600">
          Uploading a photo now persists through Supabase Storage and updates your
          profile surface, the top-right identity chip, and conversation previews.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProfileAvatar
            userId={user.id}
            name={user.profile.fullName}
            src={user.avatar}
            className="h-24 w-24 text-xl"
          />
          <div className="space-y-2">
            <p className="font-display text-xl font-semibold text-slate-950">
              {user.profile.fullName}
            </p>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="text-sm text-slate-600">{user.profile.university}</p>
          </div>
        </div>

        <form action={uploadAction} className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            name="avatar"
            onChange={() => {
              const form = inputRef.current?.form;
              if (form) {
                form.requestSubmit();
              }
            }}
          />

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => inputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Upload photo
            </Button>
          </div>

          {uploadState.message ? (
            <p
              className={`text-sm font-medium ${
                uploadState.success ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {uploadState.message}
            </p>
          ) : null}
        </form>

        <form action={resetAction}>
          <Button type="submit" variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset photo
          </Button>
          {resetState.message ? (
            <p
              className={`mt-3 text-sm font-medium ${
                resetState.success ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {resetState.message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
