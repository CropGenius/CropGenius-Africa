
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlobalMenu from "@/components/GlobalMenu";
import { Layers } from "lucide-react";
import { CreditBadge } from "./badges/CreditBadge";

export default function LayoutMenu() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <GlobalMenu />
        <Link to="/" className="flex items-center gap-2">
          <img src="/lovable-uploads/4a5d3791-0b0d-4617-8f1d-55991d16baf2.png" alt="CropGenius" className="h-8 w-auto" />
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <CreditBadge />
        <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
          <Link to="/manage-fields">
            <Layers className="h-4 w-4 mr-1" />
            Manage Fields
          </Link>
        </Button>
      </div>
    </div>
  );
}
