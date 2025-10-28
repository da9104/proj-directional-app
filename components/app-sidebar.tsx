"use client";

import * as React from "react";
import {
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Proj.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconFolder />
                  <Link href="/" className="inline-flex">
                    <span>Quick Create</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <Link href={item.url} className="inline-flex">
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarFallback className="rounded-lg">
              {session?.user?.email
                ?.split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{session?.user?.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {session?.user?.email}
            </span>
          </div>
        </SidebarMenuButton>

        <Button onClick={() => signOut({ callbackUrl: "/" })}>Log out</Button>
      </SidebarFooter>
    </Sidebar>
  );
}
