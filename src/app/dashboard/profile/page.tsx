import { getSession, getUserWithProfile } from "@/lib/auth";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/actions/profile";

type Props = { searchParams: Promise<{ saved?: string; error?: string }> };

export default async function ProfilePage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;

  const params = await searchParams;
  const user = await getUserWithProfile(session.id);
  const profile = user?.clientProfile;
  const isClient = Boolean(session.clientProfileId);

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted text-sm mt-1">Manage your account details</p>
      </div>

      {params.saved ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Profile saved successfully.
        </p>
      ) : null}
      {params.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          {profile?.clientCode ? (
            <p className="text-sm text-muted">Client ID: {profile.clientCode}</p>
          ) : null}
        </CardHeader>
        <form action={updateProfile} className="space-y-4">
          <Input label="Full name" name="name" defaultValue={user?.name} required />
          {isClient ? (
            <>
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
            </>
          ) : null}
          <Input label="Email" value={user?.email} disabled />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
