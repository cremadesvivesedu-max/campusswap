import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminUsers } from "@/server/queries/admin";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {user.profile.fullName}
            </h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-slate-600">
            <p>{user.email}</p>
            <p>{user.verificationStatus}</p>
            <p>{user.profile.university}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
