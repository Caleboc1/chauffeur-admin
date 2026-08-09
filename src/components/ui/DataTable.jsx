import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import styles from './DataTable.module.css';

/**
 * Shared DataTable component for consistent data presentation.
 */
export default function DataTable({ 
  columns, 
  data = [], 
  loading = false,
  onRowClick,
  emptyMessage = "No records found.",
  searchPlaceholder = "Search...",
  showSearch = true,
  showFilters = false,
  filterValue,
  onFilterChange,
  filterOptions,
  pageSize = 10
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Simple client-side search logic (can be extended to server-side later)
  const filteredData = data.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles.wrapper}>
      {showSearch && (
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.searchInput}
            />
          </div>
          {filterOptions && onFilterChange && (
            <select className={styles.filterSelect} value={filterValue} onChange={e => onFilterChange(e.target.value)}>
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {showFilters && (
            <button className={styles.filterBtn}>
              <Filter size={18} />
              <span>Filter</span>
            </button>
          )}
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  style={{ width: col.width }}
                  className={styles.th}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={styles.emptyRow}>
                <td colSpan={columns.length} className={styles.td}>
                  <div className={styles.loader}>Loading...</div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr 
                  key={row.id || idx} 
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className={styles.emptyRow}>
                <td colSpan={columns.length} className={styles.td}>
                  <div className={styles.emptyState}>{emptyMessage}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.resultsCount}>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
          </span>
          <div className={styles.paginationControls}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={styles.pageBtn}
            >
              <ChevronLeft size={18} />
            </button>
            <span className={styles.pageNum}>Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={styles.pageBtn}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
