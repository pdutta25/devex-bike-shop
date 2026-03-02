"use client";

// Spring sale announcement bar component for a countdown timer to April 31, 2026 , a promotional SPRING26 discount code , Shop Now links to /bikes, and a dismiss button that hides the bar when clicked, saves the dismissed state in local storage and doesn't not reappear on page reloads if dismissed, styled with amber to orange graident background and white text 
import { useState, useEffect } from "react";
import Link from "next/link";         
import { formatDistanceToNow } from "date-fns";

const ANNOUNCEMENT_DISMISSED_KEY = "announcementDismissed";
const SPRING_SALE_END_DATE = new Date("2026-04-31T23:59:59");

export default function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const dismissed = localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY);
    if (dismissed) {
      setIsDismissed(true);
    } else {
      const updateTimeLeft = () => {
        const distance = formatDistanceToNow(SPRING_SALE_END_DATE, { addSuffix: true });
        setTimeLeft(distance);
      };
      updateTimeLeft();
      const intervalId = setInterval(updateTimeLeft, 60000); // Update every minute
      return () => clearInterval(intervalId);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 flex justify-between items-center">
      <div>
        <strong>Spring Sale!</strong> Use code <em>SPRING26</em> for a discount. Offer ends {timeLeft}.
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/bikes" className="underline">
          Shop Now
        </Link>
        <button onClick={handleDismiss} className="text-white font-bold">
          &times;
        </button>
      </div>
    </div>
  );
}       

