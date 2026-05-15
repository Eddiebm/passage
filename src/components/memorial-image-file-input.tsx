'use client'

import { MEMORIAL_IMAGE_ACCEPT } from '@/lib/memorial-image'

const inputClassName =
  'mt-2 block w-full min-h-[44px] cursor-pointer rounded border border-[#3D2B1F]/20 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#3D2B1F]/10 file:px-3 file:py-2 file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50'

export function MemorialImageFileInput({
  label,
  multiple,
  disabled,
  onFiles,
}: {
  label: string
  multiple?: boolean
  disabled?: boolean
  onFiles: (files: FileList | null) => void
}) {
  return (
    <label className="block text-xs font-medium text-[#1A1A1A]/70">
      {label}
      <input
        type="file"
        accept={MEMORIAL_IMAGE_ACCEPT}
        multiple={multiple}
        disabled={disabled}
        capture="environment"
        className={inputClassName}
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </label>
  )
}
