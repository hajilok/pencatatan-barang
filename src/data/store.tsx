"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Barang, Aktivitas } from "./types"
import { dataBarang as initialBarang, dataAktivitas as initialAktivitas } from "./data"

interface BarangStore {
  barang: Barang[]
  aktivitas: Aktivitas[]
  addBarang: (item: Omit<Barang, "id" | "kode" | "tanggalUpdate" | "status"> & { status?: Barang["status"] }) => void
  updateBarang: (id: string, item: Partial<Barang>) => void
  deleteBarang: (id: string) => void
  getBarang: (id: string) => Barang | undefined
  getBarangCount: () => number
  getMenipisCount: () => number
  getHabisCount: () => number
  getKategoriCount: () => number
  getTotalNilai: () => number
}

const BarangContext = createContext<BarangStore | null>(null)

function generateKode(barangList: Barang[]): string {
  const maxNum = barangList.reduce((max, b) => {
    const match = b.kode.match(/BRG-(\d+)/)
    return match ? Math.max(max, parseInt(match[1])) : max
  }, 0)
  return `BRG-${String(maxNum + 1).padStart(3, "0")}`
}

function getStatus(stok: number): Barang["status"] {
  if (stok === 0) return "Habis"
  if (stok <= 3) return "Menipis"
  return "Tersedia"
}

export function BarangProvider({ children }: { children: ReactNode }) {
  const [barang, setBarang] = useState<Barang[]>(initialBarang)
  const [aktivitas] = useState<Aktivitas[]>(initialAktivitas)

  const addBarang = useCallback((item: Omit<Barang, "id" | "kode" | "tanggalUpdate" | "status"> & { status?: Barang["status"] }) => {
    setBarang((prev) => {
      const id = String(Date.now())
      const kode = generateKode(prev)
      const status = item.status ?? getStatus(item.stok)
      const now = new Date().toISOString().split("T")[0]
      const newItem: Barang = {
        ...item,
        id,
        kode,
        status,
        tanggalUpdate: now,
      }
      return [...prev, newItem]
    })
  }, [])

  const updateBarang = useCallback((id: string, update: Partial<Barang>) => {
    setBarang((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const updated = { ...b, ...update }
        if (update.stok !== undefined) {
          updated.status = getStatus(update.stok)
        }
        updated.tanggalUpdate = new Date().toISOString().split("T")[0]
        return updated
      })
    )
  }, [])

  const deleteBarang = useCallback((id: string) => {
    setBarang((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const getBarang = useCallback(
    (id: string) => barang.find((b) => b.id === id),
    [barang]
  )

  const getBarangCount = useCallback(() => barang.length, [barang])
  const getMenipisCount = useCallback(() => barang.filter((b) => b.status === "Menipis").length, [barang])
  const getHabisCount = useCallback(() => barang.filter((b) => b.status === "Habis").length, [barang])
  const getKategoriCount = useCallback(() => new Set(barang.map((b) => b.kategori)).size, [barang])
  const getTotalNilai = useCallback(
    () => barang.reduce((sum, b) => sum + b.harga * b.stok, 0),
    [barang]
  )

  return (
    <BarangContext.Provider
      value={{
        barang,
        aktivitas,
        addBarang,
        updateBarang,
        deleteBarang,
        getBarang,
        getBarangCount,
        getMenipisCount,
        getHabisCount,
        getKategoriCount,
        getTotalNilai,
      }}
    >
      {children}
    </BarangContext.Provider>
  )
}

export function useBarangStore() {
  const ctx = useContext(BarangContext)
  if (!ctx) throw new Error("useBarangStore must be used within BarangProvider")
  return ctx
}
