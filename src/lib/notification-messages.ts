// Notifications are stored in English (titles also drive email preferences). This
// translates them when shown in the app, in push and in email. Templates use {a}, {b}…
// for the parts that change (listing titles, names, amounts); unknown text passes through.

type Entry = [en: string, es: string, nl: string];

const entries: Entry[] = [
  // Titles
  ["Listing is live", "Tu anuncio ya está publicado", "Je advertentie staat online"],
  ["Listing submitted for review", "Anuncio enviado a revisión", "Advertentie ter beoordeling ingediend"],
  ["Listing updated", "Anuncio actualizado", "Advertentie bijgewerkt"],
  ["Listing updated and queued for review", "Anuncio actualizado y en revisión", "Advertentie bijgewerkt en ter beoordeling"],
  ["Listing status updated", "Estado del anuncio actualizado", "Status van advertentie bijgewerkt"],
  ["Listing deleted", "Anuncio eliminado", "Advertentie verwijderd"],
  ["Listing removed from your marketplace surfaces", "Anuncio retirado", "Advertentie verwijderd"],
  ["Saved to your shortlist", "Guardado en tu lista", "Bewaard in je lijst"],
  ["Someone saved your listing", "Alguien ha guardado tu anuncio", "Iemand heeft je advertentie bewaard"],
  ["New purchase request", "Nueva solicitud de compra", "Nieuw koopverzoek"],
  ["Purchase request closed", "Solicitud de compra cerrada", "Koopverzoek gesloten"],
  ["Item reserved for you", "Reservado para ti", "Voor jou gereserveerd"],
  ["Reservation released", "Reserva liberada", "Reservering vrijgegeven"],
  ["Payment recorded", "Pago registrado", "Betaling geregistreerd"],
  ["Payment completed", "Pago completado", "Betaling voltooid"],
  ["Buyer payment received", "El comprador ha pagado", "Betaling van koper ontvangen"],
  ["Ready for pickup", "Listo para recoger", "Klaar om op te halen"],
  ["Order shipped", "Pedido enviado", "Bestelling verzonden"],
  ["Order delivered", "Pedido entregado", "Bestelling bezorgd"],
  ["Order closed", "Pedido cerrado", "Bestelling gesloten"],
  ["Exchange cancelled", "Intercambio cancelado", "Ruil geannuleerd"],
  ["You've been paid", "¡Has cobrado!", "Je bent betaald"],
  ["How did it go? ⭐", "¿Qué tal fue? ⭐", "Hoe ging het? ⭐"],
  ["Still time to leave a review ⭐", "Aún puedes dejar tu valoración ⭐", "Je kunt nog een review geven ⭐"],
  ["New CampusSwap review", "Nueva valoración en CampusSwap", "Nieuwe review op CampusSwap"],
  ["Review now available", "Ya puedes valorar", "Je kunt nu een review geven"],
  ["New listing for a saved search", "Nuevo anuncio para tu búsqueda guardada", "Nieuwe advertentie voor je bewaarde zoekopdracht"],
  ["Price drop for a saved search", "Bajada de precio en tu búsqueda guardada", "Prijsdaling voor je bewaarde zoekopdracht"],
  ["Price dropped on a saved listing", "Ha bajado de precio un anuncio guardado", "Prijs verlaagd van een bewaarde advertentie"],
  ["Promotion request recorded", "Solicitud de destacado guardada", "Promotieverzoek opgeslagen"],
  ["Featured listing is active", "Tu anuncio destacado está activo", "Je uitgelichte advertentie is actief"],
  ["Something you wanted is here", "Ha aparecido algo que buscabas", "Iets wat je zocht is er"],
  ["Time for a price drop?", "¿Bajamos el precio?", "Tijd voor een prijsverlaging?"],
  ["Listing needs a check", "Anuncio pendiente de revisar", "Advertentie moet gecontroleerd worden"],
  ["Someone is waiting for your reply", "Alguien espera tu respuesta", "Iemand wacht op je antwoord"],
  ["{a} is waiting for your answer about {b}.", "{a} espera tu respuesta sobre {b}.", "{a} wacht op je antwoord over {b}."],
  ["You have {a} unanswered chats.", "Tienes {a} chats sin responder.", "Je hebt {a} onbeantwoorde chats."],
  ["{a} new listings this week in {b}. Have a look before they're gone.", "{a} anuncios nuevos esta semana en {b}. Échales un vistazo antes de que vuelen.", "{a} nieuwe advertenties deze week in {b}. Kijk snel voordat ze weg zijn."],
  ["New this week on CampusSwap", "Novedades de la semana en CampusSwap", "Nieuw deze week op CampusSwap"],
  ["{a} joined CampusSwap with your invite 🎉", "{a} se ha unido a CampusSwap con tu invitación 🎉", "{a} is lid geworden via jouw uitnodiging 🎉"],
  ["Your listing was not approved", "Tu anuncio no ha sido aprobado", "Je advertentie is niet goedgekeurd"],
  ["{a} was not approved: {b}", "{a} no ha sido aprobado: {b}", "{a} is niet goedgekeurd: {b}"],

  // Bodies
  ["{a} is now visible on CampusSwap.", "{a} ya se ve en CampusSwap.", "{a} is nu zichtbaar op CampusSwap."],
  ["{a} is waiting for trust review because your account is not student-verified yet.", "{a} está en revisión porque tu cuenta aún no está verificada como estudiante.", "{a} wacht op controle omdat je account nog niet als student is geverifieerd."],
  ["{a} is waiting for moderation before it becomes visible.", "{a} está en revisión antes de publicarse.", "{a} wordt eerst gecontroleerd voordat het zichtbaar wordt."],
  ["{a} was updated successfully.", "{a} se ha actualizado.", "{a} is bijgewerkt."],
  ["{a} was updated and moved back into review before returning to public browse.", "{a} se ha actualizado y vuelve a revisión antes de publicarse.", "{a} is bijgewerkt en wordt opnieuw gecontroleerd."],
  ["{a} is now marked as {b}.", "{a} ahora está como {b}.", "{a} staat nu op {b}."],
  ["{a} is hidden from your profile and all buyer feeds, while payment, chat, and transaction history stay intact.", "{a} ya no se muestra. Los chats y los pagos se conservan.", "{a} wordt niet meer getoond. Chats en betalingen blijven bewaard."],
  ["{a} was permanently deleted because it had no linked payment, chat, or transaction history to preserve.", "{a} se ha eliminado definitivamente.", "{a} is definitief verwijderd."],
  ["CampusSwap will keep this listing close in your saved feed.", "Lo tienes en tus guardados.", "Je vindt het terug bij je bewaarde items."],
  ["{a} saved {b}.", "{a} ha guardado {b}.", "{a} heeft {b} bewaard."],
  ["{a} wants to buy {b} with pickup.", "{a} quiere comprar {b} con recogida en mano.", "{a} wil {b} kopen en ophalen."],
  ["{a} wants to buy {b} with shipping.", "{a} quiere comprar {b} con envío.", "{a} wil {b} kopen met verzending."],
  ["{a} is now reserved while you arrange the meetup.", "{a} está reservado para ti mientras quedáis.", "{a} is voor je gereserveerd terwijl jullie afspreken."],
  ["The seller reopened the listing for new buyers.", "El vendedor ha vuelto a abrir el anuncio.", "De verkoper heeft de advertentie weer opengezet."],
  ["The seller marked this order as paid and can prepare shipment now.", "El vendedor ha marcado el pedido como pagado y ya puede enviarlo.", "De verkoper heeft de bestelling als betaald gemarkeerd en kan nu verzenden."],
  ["The seller marked this order as paid and can prepare pickup now.", "El vendedor ha marcado el pedido como pagado y ya podéis quedar.", "De verkoper heeft de bestelling als betaald gemarkeerd; jullie kunnen afspreken."],
  ["The seller marked your order as ready for pickup.", "Tu pedido está listo para recoger.", "Je bestelling is klaar om op te halen."],
  ["The seller marked your order as shipped.", "El vendedor ha enviado tu pedido.", "De verkoper heeft je bestelling verzonden."],
  ["Your parcel is on its way. Open the order to follow it.", "Tu paquete está en camino. Abre el pedido para seguirlo.", "Je pakket is onderweg. Open de bestelling om het te volgen."],
  ["The order was marked as delivered. You can now complete the exchange when everything looks good.", "El pedido se ha marcado como entregado. Complétalo cuando esté todo bien.", "De bestelling is als bezorgd gemarkeerd. Rond af als alles klopt."],
  ["The purchase request was cancelled and the listing was updated.", "La solicitud de compra se ha cancelado.", "Het koopverzoek is geannuleerd."],
  ["The listing was sold to another buyer.", "El anuncio se vendió a otra persona.", "De advertentie is aan iemand anders verkocht."],
  ["The seller removed this listing before the exchange was completed.", "El vendedor retiró el anuncio antes de terminar el intercambio.", "De verkoper heeft de advertentie verwijderd voordat de ruil rond was."],
  ["Another buyer completed payment for this listing first.", "Otra persona pagó este anuncio antes.", "Iemand anders heeft deze advertentie eerder betaald."],
  ["Your payment went through. CampusSwap holds it until you confirm the parcel arrived.", "Pago hecho. CampusSwap lo guarda hasta que confirmes que te ha llegado.", "Betaling gelukt. CampusSwap houdt het vast tot je bevestigt dat het pakket er is."],
  ["Your payment went through. The seller can now prepare pickup.", "Pago hecho. Ya podéis quedar para la entrega.", "Betaling gelukt. Jullie kunnen nu afspreken."],
  ["Your payment went through. The seller can now prepare shipment.", "Pago hecho. El vendedor ya puede enviarlo.", "Betaling gelukt. De verkoper kan het nu versturen."],
  ["A buyer paid for this item with shipping. Send it and add the tracking number; you get paid when it arrives.", "Un comprador ha pagado con envío. Envíalo y añade el número de seguimiento: cobras cuando llegue.", "Een koper heeft betaald met verzending. Verstuur het en voeg het trackingnummer toe; je wordt betaald als het aankomt."],
  ["A buyer paid for this item. You can prepare the pickup handoff now.", "Un comprador ha pagado. Ya podéis quedar para la entrega.", "Een koper heeft betaald. Jullie kunnen nu afspreken."],
  ["The buyer's payment is on its way to your Stripe account.", "El pago va de camino a tu cuenta de Stripe.", "De betaling is onderweg naar je Stripe-account."],
  ["Rate the seller in one tap. Reviews help every student trade safely.", "Valora al vendedor en un toque. Las valoraciones ayudan a todos a comprar con confianza.", "Beoordeel de verkoper met één tik. Reviews helpen iedereen veilig te handelen."],
  ["Rate the buyer in one tap. Reviews help every student trade safely.", "Valora al comprador en un toque. Las valoraciones ayudan a todos a comprar con confianza.", "Beoordeel de koper met één tik. Reviews helpen iedereen veilig te handelen."],
  ["Your exchange is done. Give the seller a few stars — it takes 10 seconds.", "Tu intercambio ha terminado. Dale unas estrellas al vendedor: son 10 segundos.", "Je ruil is klaar. Geef de verkoper een paar sterren — het duurt 10 seconden."],
  ["Your exchange is done. Give the buyer a few stars — it takes 10 seconds.", "Tu intercambio ha terminado. Dale unas estrellas al comprador: son 10 segundos.", "Je ruil is klaar. Geef de koper een paar sterren — het duurt 10 seconden."],
  ["A completed exchange review just landed on your profile.", "Tienes una nueva valoración en tu perfil.", "Er staat een nieuwe review op je profiel."],
  ["{a} matches your saved search \"{b}\".", "{a} encaja con tu búsqueda «{b}».", "{a} past bij je zoekopdracht \"{b}\"."],
  ["{a} dropped from EUR {b} to EUR {c}.", "{a} ha bajado de {b} € a {c} €.", "{a} is verlaagd van € {b} naar € {c}."],
  ["{a} now matches \"{b}\" at a lower price: EUR {c}.", "{a} encaja con «{b}» a un precio más bajo: {c} €.", "{a} past nu bij \"{b}\" voor een lagere prijs: € {c}."],
  ["Your listing is now boosted across CampusSwap featured discovery surfaces.", "Tu anuncio ya aparece como destacado.", "Je advertentie wordt nu uitgelicht."],
  ["Your EUR 2 featured listing payment was processed successfully.", "El pago de 2 € para destacar tu anuncio se ha completado.", "De betaling van € 2 voor het uitlichten is gelukt."],
  ["{a} matches what you asked for: \"{b}\".", "{a} encaja con lo que pediste: «{b}».", "{a} past bij wat je zocht: \"{b}\"."],
  ["{a} has been listed for {b} days. Dropping to {c} usually brings new chats.", "{a} lleva {b} días publicado. Bajarlo a {c} suele traer chats nuevos.", "{a} staat al {b} dagen online. Verlagen naar {c} levert vaak nieuwe chats op."],
  ["{a} was held for a check: {b}", "{a} está retenido para revisar: {b}", "{a} wordt vastgehouden voor controle: {b}"]
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const compiled = entries.map(([en, es, nl]) => {
  const names: string[] = [];
  const pattern = escapeRegExp(en).replace(/\\\{([a-z])\\\}/g, (_, name: string) => {
    names.push(name);
    return "(.+?)";
  });
  return { regex: new RegExp(`^${pattern}$`, "s"), names, es, nl };
});

export function translateNotificationText(text: string, locale: string) {
  if ((locale !== "es" && locale !== "nl") || !text) {
    return text;
  }

  for (const entry of compiled) {
    const match = entry.regex.exec(text);
    if (!match) continue;
    let output = entry[locale];
    entry.names.forEach((name, index) => {
      output = output.replace(`{${name}}`, match[index + 1]);
    });
    return output;
  }

  return text;
}
