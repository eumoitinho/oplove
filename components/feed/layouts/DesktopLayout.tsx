"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DesktopLayoutProps {
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Desktop Layout Component
 * Implements exact 8-column grid system for 1440px screens
 * Container: 1440px max-width | Margins: 64px | Gutter: 16px
 * Left Sidebar: Columns 1-2, 317px width, 1024px height, fixed position
 * Timeline: Columns 3-6 (4 columns in the middle)
 * Right Sidebar: Columns 7-8, 317px width, 1024px height, fixed position
 */
export function DesktopLayout({ 
  leftSidebar, 
  rightSidebar, 
  children, 
  className 
}: DesktopLayoutProps) {
  return (
    <div className={cn(
      "feed-container",
      "hidden desktop:block", // Only show on desktop (1440px+)
      className
    )}>
      {/* 8-column grid with exact spacing */}
      <div className="feed-grid">
        
        {/* Left Sidebar - Columns 1-2, 317px fixed width, 1024px height */}
        <aside className="feed-left-sidebar scrollbar-thin">
          <div className="h-full">
            {leftSidebar}
          </div>
        </aside>

        {/* Main Timeline - Columns 3-6 (4 middle columns) */}
        <main className="feed-timeline">
          {children}
        </main>

        {/* Right Sidebar - Columns 7-8, 317px fixed width, 1024px height */}
        <aside className="feed-right-sidebar scrollbar-thin">
          <div className="h-full">
            {rightSidebar}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Tablet Layout Component - (1024px x 1366px)
 * Grid: 12 columns
 * Left Sidebar: 3 columns, 1366px height
 * Timeline: 6 columns in the middle  
 * Right Sidebar: 3 columns, 1366px height
 * Margins reduced: 32px
 */
export function TabletLayout({ 
  leftSidebar, 
  rightSidebar,
  children, 
  className 
}: DesktopLayoutProps) {
  return (
    <div className={cn(
      "feed-container",
      "hidden tablet:block desktop:hidden", // Only show on tablet (1024px-1439px)
      className
    )}>
      {/* 12-column grid with 32px margins */}
      <div className="feed-grid">
        
        {/* Left Sidebar - 3 columns, 1366px height */}
        <aside className="feed-left-sidebar scrollbar-thin">
          <div className="h-full">
            {leftSidebar}
          </div>
        </aside>

        {/* Main Timeline - 6 columns in the middle */}
        <main className="feed-timeline">
          {children}
        </main>

        {/* Right Sidebar - 3 columns, 1366px height */}
        <aside className="feed-right-sidebar scrollbar-thin">
          <div className="h-full">
            {rightSidebar}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Mobile Layout Component - (384px x 800px)
 * Layout: Stack vertical (flex-col)
 * Sidebars: Hidden
 * Timeline: Full width
 * Margins: 16px
 */
export function MobileLayout({ 
  children, 
  className 
}: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      "feed-container",
      "block tablet:hidden", // Only show on mobile
      className
    )}>
      {/* Stack vertical layout with 16px margins */}
      <div className="feed-grid">
        {/* Main Content - Full width, sidebars hidden */}
        <main className="feed-timeline">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Responsive Feed Layout
 * Automatically switches between desktop, tablet, and mobile layouts
 */
interface ResponsiveFeedLayoutProps {
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ResponsiveFeedLayout({
  leftSidebar,
  rightSidebar,
  children,
  className
}: ResponsiveFeedLayoutProps) {
  return (
    <>
      {/* Desktop Layout - 1440px+ */}
      <DesktopLayout
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
        className={className}
      >
        {children}
      </DesktopLayout>

      {/* Tablet Layout - 1024px to 1439px */}
      <TabletLayout
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
        className={className}
      >
        {children}
      </TabletLayout>

      {/* Mobile Layout - up to 1023px */}
      <MobileLayout className={className}>
        {children}
      </MobileLayout>
    </>
  );
}