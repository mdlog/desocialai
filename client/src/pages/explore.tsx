import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { LeftSidebar } from "../components/layout/left-sidebar";
import { RightSidebar } from "../components/layout/right-sidebar";
import { ContentSearch } from "../components/discovery/content-search";
import { HashtagTrending } from "../components/discovery/hashtag-trending";
import { AICategorization } from "../components/discovery/ai-categorization";

export function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <LeftSidebar />
          </div>

          <main className="lg:col-span-6 space-y-6">
            <div className="space-y-6">
              <ContentSearch />
              <HashtagTrending />
              <AICategorization />
            </div>
          </main>

          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}