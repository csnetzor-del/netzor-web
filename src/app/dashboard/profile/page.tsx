import { getSession, getUserWithProfile } from "@/lib/auth";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/actions/profile";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const user = await getUserWithProfile(session.id);
  const profile = user?.clientProfile;

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted text-sm mt-1">Manage your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <p className="text-sm text-muted">Client ID: {profile?.clientCode}</p>
        </CardHeader>
        <form action={updateProfile} className="space-y-4">
          <Input label="Full name" name="name" defaultValue={user?.name} required />
          <Input
            label="Company"
            name="companyName"
            defaultValue={profile?.companyName ?? ""}
          />
          <Input label="Phone" name="phone" defaultValue={profile?.phone ?? ""} />
          <Input
            label="Address"
            name="address"
            defaultValue={profile?.address ?? ""}
          />
          <Input label="Email" value={user?.email} disabled />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
