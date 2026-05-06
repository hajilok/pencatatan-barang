export interface Barang {
  id: string
  kode: string
  nama: string
  kategori: string
  stok: number
  satuan: string
  harga: number
  deskripsi: string
  status: "Tersedia" | "Menipis" | "Habis"
  lokasi: string
  tanggalMasuk: string
  tanggalUpdate: string
}

export interface Kategori {
  id: string
  nama: string
  jumlahBarang: number
}

export interface Aktivitas {
  id: string
  barangId: string
  barangNama: string
  aksi: "Barang Masuk" | "Barang Keluar" | "Penyesuaian" | "Barang Baru"
  jumlah: number
  tanggal: string
  keterangan: string
}

export type StatusBarang = Barang["status"]
