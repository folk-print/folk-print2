import { useRef, useState } from 'react'
import { useDesigner } from '../state/DesignerContext.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { ACCEPTED_TYPES } from '../lib/upload.js'
import { Upload } from './Icons.jsx'

export default function UploadZone() {
  const { addFiles } = useDesigner()
  const { t } = useI18n()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const onFiles = (fl) => { if (fl && fl.length) addFiles(fl) }

  return (
    <div
      className={`upload-zone${dragging ? ' dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label={t('upload_title')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(e) => { onFiles(e.target.files); e.target.value = '' }}
      />
      <div className="upload-icon" aria-hidden><Upload /></div>
      <strong>{t('upload_title')}</strong>
      <span className="upload-sub">{t('upload_hint')}</span>
    </div>
  )
}
