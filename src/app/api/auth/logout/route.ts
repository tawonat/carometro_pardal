import { api, checkOrigin, success } from '@/lib/http';
import { revokeSession } from '@/lib/auth';
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    await revokeSession();
    return success({ loggedOut: true });
  });
}
