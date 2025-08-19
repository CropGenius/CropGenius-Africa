"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SmartSearchProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onStatusChange?: (status: string) => void
  onSortChange?: (sort: string) => void
  searchValue?: string
  statusValue?: string
  sortValue?: string
}

const SmartSearch = ({ 
  placeholder = "Search questions...", 
  onSearch, 
  onStatusChange, 
  onSortChange,
  searchValue = "",
  statusValue = "open",
  sortValue = "created_at"
}: SmartSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchValue)
  const [showFilters, setShowFilters] = useState(false)

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "answered", label: "Answered" },
    { value: "closed", label: "Closed" }
  ]

  const sortOptions = [
    { value: "created_at", label: "Latest" },
    { value: "vote_score", label: "Most Voted" },
    { value: "answer_count", label: "Most Answered" },
    { value: "view_count", label: "Most Viewed" }
  ]

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (onSearch) onSearch(value)
  }

  const handleFocus = () => {
    setIsFocused(true)
    setShowFilters(true)
  }

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false)
      setShowFilters(false)
    }, 200)
  }

  useEffect(() => {
    setSearchQuery(searchValue)
  }, [searchValue])

  return (
    <div className="relative w-full">
      <motion.div
        className="relative flex items-center w-full"
        initial={{ scale: 1 }}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md",
            isFocused ? "border-green-400 shadow-lg bg-white" : "border-gray-200 bg-white/90"
          )}
          animate={{
            boxShadow: isFocused
              ? "0 8px 25px rgba(34, 197, 94, 0.15)"
              : "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="pl-4 py-3">
            <Search
              size={20}
              className={cn(
                "transition-colors duration-300",
                isFocused ? "text-green-600" : "text-gray-400"
              )}
            />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full py-3 bg-transparent outline-none placeholder:text-gray-400 font-medium text-base text-gray-800"
          />

          <motion.div
            className="pr-4"
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-gray-400" />
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">STATUS</label>
                <div className="flex gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onStatusChange?.(option.value)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full transition-colors",
                        statusValue === option.value
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">SORT BY</label>
                <div className="flex gap-2 flex-wrap">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onSortChange?.(option.value)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full transition-colors",
                        sortValue === option.value
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SmartSearch }