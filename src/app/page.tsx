"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { SummaryRibbon } from "@/components/dashboard/SummaryRibbon";
import { SkeletonSummary } from "@/components/dashboard/SkeletonSummary";
import { SkeletonCard } from "@/components/dashboard/SkeletonCard";
import { SkeletonCardRow } from "@/components/dashboard/SkeletonCardRow";
import { useLiveAccounts } from "@/hooks/useLiveAccounts";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LayoutDashboard, Bell, Search, Menu, LayoutGrid, List, LogOut, ChevronDown, ChevronUp, Sun, Moon } from "lucide-react";

export default function Home() {
  const { accounts, isLoading, isSocketConnected } = useLiveAccounts();
  const user = useUser();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "row">("row");
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl h-16 flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-9 w-9 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
            <LayoutDashboard className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center px-3 py-1.5 bg-white/5 rounded-full border border-white/5 focus-within:border-white/20 focus-within:bg-white/10 transition-all">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input type="text" placeholder="Search accounts..." className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all placeholder:text-muted-foreground/50" />
          </div>

          <div className="flex items-center gap-3">
            {/* <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            </button> */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <span className="text-sm text-foreground font-medium">{user.name}</span>
            </div>
            {/* <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 flex items-center justify-center border border-white/10 cursor-pointer hover:border-primary/50 transition-colors" title={user.name}>
              <span className="text-xs font-bold text-white">{user.initials}</span>
            </div> */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-all relative overflow-hidden"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <div className="relative w-5 h-5">
                <Sun className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${theme === "light"
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0"
                  }`} />
                <Moon className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${theme === "dark"
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
                  }`} />
              </div>
            </button>
            <button
              onClick={logout}
              className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <button className="md:hidden p-2 text-muted-foreground">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-6 lg:px-12 pb-12 max-w-[1920px] mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight  text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground max-w-xl">
              Real-time monitoring of <span className="text-foreground ">{isLoading ? '...' : accounts.length} active trading accounts</span>.

            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 transition-colors duration-300 ${isSocketConnected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
              }`}>
              <span className={`h-1.5 w-1.5 rounded-full relative ${isSocketConnected ? "bg-emerald-500" : "bg-yellow-500"}`}>
                {isSocketConnected && (
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                )}
              </span>
              {isSocketConnected ? "Live Feed Active" : "Connecting..."}
            </div>
            {/* <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              + Connect Account
            </button> */}
          </div>
        </div>

        {showSummary && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {isLoading ? <SkeletonSummary /> : <SummaryRibbon accounts={accounts} />}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Active Accounts</h2>
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                title={showSummary ? "Hide Summary" : "Show Summary"}
              >
                {showSummary ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Hide Overview
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Show Overview
                  </>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-card border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-all ${viewMode === "grid"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("row")}
                  className={`p-1.5 rounded transition-all ${viewMode === "row"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  title="Row View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              {/* <select className="bg-card border border-white/10 rounded-lg text-xs px-3 py-1.5 text-muted-foreground outline-none focus:border-white/20">
                <option>Sort by Equity</option>
                <option>Sort by Name</option>
                <option>Sort by P/L</option>
              </select> */}
            </div>
          </div>

          {isLoading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCardRow key={i} />
                ))}
              </div>
            )
          ) : (
            <DashboardGrid accounts={accounts} viewMode={viewMode} />
          )}
        </div>
      </main>
    </div>
  );
}
