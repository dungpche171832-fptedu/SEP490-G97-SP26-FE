// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { getToken } from "@/lib/auth/auth.service";

// type AuthGuardState = "checking" | "authorized" | "unauthorized";

// export function useAuthGuard(): AuthGuardState {
//   const router = useRouter();
//   const [state, setState] = useState<AuthGuardState>("checking");

//   useEffect(() => {
//     const token = getToken();
//     if (!token) {
//       setState("unauthorized");
//       router.replace("/login");
//       return;
//     }
//     setState("authorized");
//   }, [router]);

//   return state;
// }
