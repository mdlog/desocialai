import { Github, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-og-slate-800 border-t border-og-slate-200 dark:border-og-slate-700 mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">0G</span>
              </div>
              <h3 className="text-lg font-bold gradient-text">DeSocialAI</h3>
            </div>
            <p className="text-og-slate-600 dark:text-og-slate-400 text-sm">
              Decentralized social media with AI feeds on 0G Chain.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-og-slate-900 dark:text-og-slate-100 text-sm">Resources</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                0G Chain
              </a>
              <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                Docs
              </a>
              <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-og-slate-200 dark:border-og-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-og-slate-600 dark:text-og-slate-400">
              © 2025 DeSocialAI. Powered by 0G Chain.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}