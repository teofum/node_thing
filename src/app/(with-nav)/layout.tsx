import { ReactNode } from "react";

export default function LayoutWithNav({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div>
      <nav>aaa</nav>
      <main>{children}</main>
    </div>
  );
}
