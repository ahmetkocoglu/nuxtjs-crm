import ExcelJS from 'exceljs'

export interface ExportColumn {
  header: string
  key: string
  width?: number
}

export const generateExcel = async (
  data: any[],
  columns: ExportColumn[],
  sheetName: string = 'Data'
) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  // Set columns
  worksheet.columns = columns

  // Style header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' },
  }
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(1).height = 25

  // Add data
  data.forEach((item) => {
    worksheet.addRow(item)
  })

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}

export const generateCSV = (data: any[], columns: ExportColumn[]) => {
  // Header row
  const header = columns.map((col) => col.header).join(',')
  
  // Data rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = item[col.key]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      })
      .join(',')
  })

  return [header, ...rows].join('\n')
}