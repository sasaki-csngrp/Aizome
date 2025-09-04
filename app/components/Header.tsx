"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  const menuItems = (
    <>
      <SheetClose asChild>
        <Link href="/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          レポート
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          クエスト
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          トレンド
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          variant="ghost"
        >
          ログアウト
        </Button>
      </SheetClose>
    </>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/Aizome_pop.png" alt="Aizome Logo" className="h-10 w-10" />
              <span className="text-lg font-semibold text-gray-800">Aizome</span>
            </Link>
            <div className="hidden md:block text-gray-600">
              {user ? `ようこそ ${user.name} さん` : ""}
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/reports" className="text-gray-600 hover:text-gray-800">
              レポート
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-800">
              クエスト
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-800">
              トレンド
            </Link>
            <Button onClick={() => signOut({ callbackUrl: '/' })} variant="ghost" size="sm">
              ログアウト
            </Button>
            <Avatar>
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback>
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </nav>

          {/* Mobile Menu (Hamburger) */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="sr-only">メニュー</SheetTitle>
                  <SheetDescription className="sr-only">サイトの主要なナビゲーションリンクです。</SheetDescription>
                </SheetHeader>
                <div className="p-4">
                  <div className="mb-4">
                    <Avatar className="mx-auto">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-center mt-2">
                      {user ? `ようこそ ${user.name} さん` : ""}
                    </p>
                  </div>
                  <nav className="flex flex-col space-y-2">{menuItems}</nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
