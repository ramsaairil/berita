"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, MousePointerClick, MessageSquare, Heart, Clock } from "lucide-react";
import Link from "next/link";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/app/actions/notifications";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    const [notifs, count] = await Promise.all([
      getNotifications(),
      getUnreadCount()
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
  };

  useEffect(() => {
    fetchStatus();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAsRead(id);
    fetchStatus();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchStatus();
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j yang lalu`;
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-600 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100" 
        aria-label="Notifications"
      >
        <Bell className="w-[22px] h-[22px]" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Invisible backdrop to capture clicks on mobile to easily close */}
          <div 
            className="fixed inset-0 z-[99] sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="
            fixed top-[65px] left-4 right-4 w-auto
            sm:absolute sm:top-auto sm:bottom-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-[380px]
            bg-white border border-gray-100
            rounded-2xl
            shadow-2xl overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
            origin-top sm:origin-top-right
            z-[100]
            flex flex-col
          ">
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h3 className="font-bold text-[15px] sm:text-[16px]">Notifikasi</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] sm:text-[12px] font-semibold text-[#0d88b5] hover:underline"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[65vh] sm:max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/berita/${notif.article?.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (!notif.read) markAsRead(notif.id);
                    }}
                    className={`flex gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.read ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="shrink-0 relative">
                      <img
                        src={notif.actor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actor.name}`}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-100"
                        alt=""
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white ${notif.type === "LIKE_COMMENT" ? "bg-pink-500" : "bg-blue-500"}`}>
                        {notif.type === "LIKE_COMMENT" ? (
                          <Heart className="w-2.5 h-2.5 text-white fill-current" />
                        ) : (
                          <MessageSquare className="w-2.5 h-2.5 text-white fill-current" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] sm:text-[13px] leading-snug">
                        <span className="font-bold text-black">{notif.actor.name}</span>{" "}
                        {notif.type === "LIKE_COMMENT" ? (
                          <span className="text-gray-600">menyukai komentar ini:</span>
                        ) : (
                          <span className="text-gray-600">membalas di menu:</span>
                        )}{" "}
                        <span className="font-semibold text-gray-900 line-clamp-1">"{notif.article?.title}"</span>
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] text-gray-400">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {timeAgo(notif.createdAt)}
                      </div>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="shrink-0 w-2 h-2 bg-[#0d88b5] rounded-full mt-1 sm:mt-2"
                        title="Tandai dibaca"
                      />
                    )}
                  </Link>
                ))
              ) : (
                <div className="p-10 sm:p-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-[13px] sm:text-[14px]">Belum ada notifikasi.</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2.5 sm:p-3 bg-gray-50/50 text-center border-t border-gray-100 shrink-0">
                <button className="text-[11px] sm:text-[12px] font-bold text-gray-500 hover:text-black">
                  Lihat Semua Notifikasi
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
