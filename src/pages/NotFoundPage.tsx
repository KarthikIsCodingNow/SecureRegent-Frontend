import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <div className="text-4xl font-display font-medium text-text-primary mb-2">
        404
      </div>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        The requested page could not be found. Please check the URL or return to the overview.
      </p>
      <Link
        to="/app"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <ArrowLeft size={14} weight="bold" />
        <span>Back to overview</span>
      </Link>
    </div>
  );
};
