import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RESEARCH_DOMAINS, DOMAIN_CATEGORIES } from '../utils/researchDomains';

/**
 * DomainMultiSelect — A modern, searchable multi-select dropdown for research domains.
 *
 * Props:
 *   value       — Array of selected domain strings
 *   onChange     — Callback: (newArray) => void
 *   label        — Field label
 *   placeholder  — Search placeholder
 *   singleSelect — If true, only one value can be selected (for track name)
 *   maxSelections — Max items allowed (0 = unlimited)
 */
const DomainMultiSelect = ({
  value = [],
  onChange,
  label = 'Domains',
  placeholder = 'Search or select domains...',
  singleSelect = false,
  maxSelections = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showOther, setShowOther] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Normalize value to always be an array
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Filter domains by search
  const filteredDomains = useMemo(() => {
    if (!search.trim()) return RESEARCH_DOMAINS;
    const q = search.toLowerCase();
    return RESEARCH_DOMAINS.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [search]);

  // Group filtered domains by category
  const grouped = useMemo(() => {
    const map = {};
    for (const d of filteredDomains) {
      if (!map[d.category]) map[d.category] = [];
      map[d.category].push(d);
    }
    // Keep category order from master list
    return DOMAIN_CATEGORIES
      .filter((cat) => map[cat])
      .map((cat) => ({ category: cat, domains: map[cat] }));
  }, [filteredDomains]);

  const toggleDomain = (domainLabel) => {
    if (selected.includes(domainLabel)) {
      // Remove
      onChange(selected.filter((d) => d !== domainLabel));
    } else {
      if (singleSelect) {
        onChange([domainLabel]);
        setIsOpen(false);
      } else {
        if (maxSelections > 0 && selected.length >= maxSelections) return;
        onChange([...selected, domainLabel]);
      }
    }
    setSearch('');
  };

  const removeDomain = (domainLabel) => {
    onChange(selected.filter((d) => d !== domainLabel));
  };

  const handleAddCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    if (selected.includes(trimmed)) {
      setCustomValue('');
      setShowOther(false);
      return;
    }
    if (singleSelect) {
      onChange([trimmed]);
    } else {
      if (maxSelections > 0 && selected.length >= maxSelections) return;
      onChange([...selected, trimmed]);
    }
    setCustomValue('');
    setShowOther(false);
    setIsOpen(false);
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Selected chips + trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[44px] w-full px-3 py-2 bg-white border rounded-lg cursor-pointer transition-all duration-200
          ${isOpen
            ? 'border-primary-500 ring-2 ring-primary-100 shadow-sm'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-200 transition-all duration-150 hover:bg-primary-100 group"
              >
                {domain}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDomain(domain);
                  }}
                  className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 text-primary-500 hover:text-primary-700 transition-colors duration-150"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl animate-fadeIn overflow-hidden"
          style={{ maxHeight: '360px' }}
        >
          {/* Search Input */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-2.5">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search domains..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 transition-all"
              />
            </div>
          </div>

          {/* Scrollable Options */}
          <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
            {grouped.length === 0 && !search.trim() && (
              <div className="p-4 text-center text-sm text-gray-500">No domains available</div>
            )}

            {grouped.length === 0 && search.trim() && (
              <div className="p-4 text-center text-sm text-gray-500">
                No matching domains found for "<span className="font-medium">{search}</span>"
              </div>
            )}

            {grouped.map(({ category, domains }) => (
              <div key={category}>
                {/* Category Header */}
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {category}
                  </span>
                </div>

                {/* Domain Items */}
                {domains.map((d) => {
                  const isSelected = selected.includes(d.label);
                  const isDisabled = !isSelected && maxSelections > 0 && selected.length >= maxSelections;

                  return (
                    <button
                      type="button"
                      key={d.label}
                      onClick={() => !isDisabled && toggleDomain(d.label)}
                      disabled={isDisabled}
                      className={`w-full text-left px-4 py-2 text-sm transition-all duration-100 flex items-center justify-between
                        ${isSelected
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : isDisabled
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span>{d.label}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* ─── "Others" Option ─── */}
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowOther(!showOther)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-all duration-100 flex items-center gap-2"
              >
                <span className="text-base">✏️</span>
                <span>Others — Enter a custom domain</span>
                <svg
                  className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${showOther ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showOther && (
                <div className="px-4 pb-3 animate-fadeIn">
                  {/* Warning */}
                  <div className="flex items-start gap-2 p-2.5 mb-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <span className="font-semibold">Abbreviations are not allowed.</span> Please enter the full domain/track name (e.g., write "Natural Language Processing" instead of "NLP").
                    </p>
                  </div>

                  {/* Custom input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={handleCustomKeyDown}
                      placeholder="Enter full domain name..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      disabled={!customValue.trim()}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-150
                        ${customValue.trim()
                          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainMultiSelect;
