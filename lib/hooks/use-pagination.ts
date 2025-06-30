"use client"

import { useState } from "react"

interface UsePaginationProps {
  initialPage?: number
  initialLimit?: number
}

export function usePagination({ initialPage = 1, initialLimit = 10 }: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const nextPage = () => setPage((prev) => prev + 1)
  const prevPage = () => setPage((prev) => Math.max(1, prev - 1))
  const goToPage = (pageNumber: number) => setPage(Math.max(1, pageNumber))
  const changeLimit = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  }
}
