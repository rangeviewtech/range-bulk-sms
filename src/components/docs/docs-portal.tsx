'use client';

import * as React from 'react';
import { DocsHeader } from './docs-header';
import { PortalSidebar } from './portal-sidebar';
import { PortalHero } from './portal-hero';
import { PortalSearchBar } from './portal-search-bar';
import { PortalEndpoints } from './portal-endpoints';
import { PortalInfoSidebar } from './portal-info-sidebar';
import { PortalFooter } from './portal-footer';
import { PortalGuidesModal, GuideTopic } from './portal-guides-modal';
import { DocsQuickStart } from './docs-quickstart';
import { DocsSearchModal } from './docs-search';
import { CodeSnippetViewer } from './code-snippets';
import { WebhookSimulator } from './webhook-simulator';
import { ChangelogPanel } from './changelog-panel';
import SwaggerUI from '@/components/swagger-ui';
import { PORTAL_COLORS } from './portal-tokens';
import { Terminal, ChevronDown, BookOpen } from 'lucide-react';

interface DocsPortalProps {
  spec: Record<string, unknown>;
}

export function DocsPortal({ spec }: DocsPortalProps) {
  const [environment, setEnvironment] = React.useState<'sandbox' | 'production'>('sandbox');
  const [activeTab, setActiveTab] = React.useState<string>('reference');
  const [activeSection, setActiveSection] = React.useState<string>('overview');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All Categories');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [activeGuide, setActiveGuide] = React.useState<GuideTopic | null>(null);
  const [showRawSwagger, setShowRawSwagger] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const categories = ['All Categories', 'Finance', 'Contacts', 'Messaging', 'Webhooks'];

  // Handle section select from left sidebar
  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'overview') {
      setSearchQuery('');
      setSelectedCategory('All Categories');
    } else {
      setSearchQuery(sectionId);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        backgroundColor: PORTAL_COLORS.mainBg,
        color: PORTAL_COLORS.primaryText,
      }}
    >
      {/* Top Navigation Bar */}
      <DocsHeader
        environment={environment}
        onEnvironmentChange={setEnvironment}
        onOpenSearch={() => setIsSearchOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'reference') {
            setActiveSection('overview');
            setSearchQuery('');
          }
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col">
        {/* If Active Tab is API Reference (Default matching screenshot) */}
        {activeTab === 'reference' && (
          <div className="flex-1 flex flex-col lg:flex-row w-full items-stretch">
            {/* Left Sidebar (~260px) */}
            <PortalSidebar
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              onOpenGuide={(topic) => setActiveGuide(topic)}
              isMobileDrawerOpen={isSidebarOpen}
              onCloseMobileDrawer={() => setIsSidebarOpen(false)}
            />

            {/* Central Documentation & Endpoints Area */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Mobile Drawer Trigger Button (Hidden from iPads to Large: md:hidden) */}
              <div
                className="md:hidden flex items-center justify-between gap-2 p-2.5 rounded-xl border"
                style={{
                  backgroundColor: PORTAL_COLORS.cardBg,
                  borderColor: PORTAL_COLORS.border,
                }}
              >
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
                  style={{
                    backgroundColor: PORTAL_COLORS.elevatedBg,
                    borderColor: PORTAL_COLORS.borderLight,
                    color: PORTAL_COLORS.primaryText,
                  }}
                >
                  <BookOpen className="h-4 w-4" style={{ color: PORTAL_COLORS.accentBlue }} />
                  <span>Browse API Reference & Guides</span>
                </button>
                <span
                  className="text-[11px] font-mono px-2 py-1 rounded truncate max-w-[140px]"
                  style={{ color: PORTAL_COLORS.secondaryText, backgroundColor: PORTAL_COLORS.sidebarBg }}
                >
                  {activeSection === 'overview' ? 'Overview' : activeSection}
                </span>
              </div>

              {/* Hero Section */}
              <PortalHero environment={environment} />

              {/* Search & Category Filter */}
              <PortalSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categories={categories}
              />

              {/* API Endpoints Section */}
              <PortalEndpoints
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onOpenSwagger={() => setShowRawSwagger(true)}
              />

              {/* Interactive Swagger Explorer (Collapsible for advanced exploration) */}
              <div
                className="pt-6 border-t"
                style={{ borderColor: PORTAL_COLORS.border }}
              >
                <button
                  onClick={() => setShowRawSwagger(!showRawSwagger)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left hover:opacity-95"
                  style={{
                    backgroundColor: PORTAL_COLORS.cardBg,
                    borderColor: PORTAL_COLORS.border,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: PORTAL_COLORS.elevatedBg,
                        color: PORTAL_COLORS.accentBlue,
                      }}
                    >
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: PORTAL_COLORS.primaryText }}>
                        Interactive OpenAPI Specification & Swagger Console
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: PORTAL_COLORS.secondaryText }}>
                        Direct interactive browser requests, payload schemas, and raw JSON spec.
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showRawSwagger ? 'rotate-180' : ''}`}
                    style={{ color: PORTAL_COLORS.secondaryText }}
                  />
                </button>

                {showRawSwagger && (
                  <div
                    className="mt-4 p-4 sm:p-6 rounded-2xl border shadow-lg animate-in fade-in duration-150"
                    style={{
                      backgroundColor: PORTAL_COLORS.cardBg,
                      borderColor: PORTAL_COLORS.border,
                    }}
                  >
                    <SwaggerUI spec={spec} environment={environment} />
                  </div>
                )}
              </div>

              {/* Inline Info Cards for Mobile & Tablet (<xl viewports) */}
              <PortalInfoSidebar
                environment={environment}
                onOpenGuide={(topic) => setActiveGuide(topic)}
                layout="inline"
              />
            </main>

            {/* Right Information Rail (~300px on desktop xl:block) */}
            <PortalInfoSidebar
              environment={environment}
              onOpenGuide={(topic) => setActiveGuide(topic)}
              layout="rail"
            />
          </div>
        )}

        {/* Quickstart Tab */}
        {activeTab === 'quickstart' && (
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: PORTAL_COLORS.cardBg,
                borderColor: PORTAL_COLORS.border,
              }}
            >
              <DocsQuickStart
                environment={environment}
                onSwitchToSnippets={() => setActiveTab('snippets')}
              />
            </div>
          </main>
        )}

        {/* Code Snippets & SDKs Tab */}
        {activeTab === 'snippets' && (
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: PORTAL_COLORS.cardBg,
                borderColor: PORTAL_COLORS.border,
              }}
            >
              <CodeSnippetViewer environment={environment} />
            </div>
          </main>
        )}

        {/* Webhooks & DLR Simulator Tab */}
        {activeTab === 'webhooks' && (
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: PORTAL_COLORS.cardBg,
                borderColor: PORTAL_COLORS.border,
              }}
            >
              <WebhookSimulator />
            </div>
          </main>
        )}

        {/* Changelog Tab */}
        {activeTab === 'changelog' && (
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: PORTAL_COLORS.cardBg,
                borderColor: PORTAL_COLORS.border,
              }}
            >
              <ChangelogPanel />
            </div>
          </main>
        )}
      </div>

      {/* Global Footer */}
      <PortalFooter />

      {/* Global Search Dialog (Cmd/Ctrl + K) */}
      <DocsSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Developer Guides Modal */}
      <PortalGuidesModal
        topic={activeGuide}
        onClose={() => setActiveGuide(null)}
      />
    </div>
  );
}
