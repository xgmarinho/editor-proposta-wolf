import React, { useRef, useState } from "react";
import { iconNames, getIcon } from "../data/iconRegistry.js";

export function TextField({ label, value, onChange, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <label className="fld">
      <span>{label}</span>
      <Tag value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={textarea ? 3 : undefined} />
    </label>
  );
}

export function NumberField({ label, value, onChange }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

// Lê um File e devolve data URL base64 (autocontido).
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function ImageDrop({ label, value, onChange }) {
  const inputRef = useRef(null);
  async function handleFiles(files) {
    if (files && files[0]) onChange(await fileToDataUrl(files[0]));
  }
  return (
    <div className="fld">
      <span>{label}</span>
      <div
        className="imgdrop"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        {value ? <img src={value} alt="" /> : <em>Arraste ou clique para enviar</em>}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

export function IconPicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const Current = getIcon(value);
  return (
    <div className="fld iconpick">
      <span>{label}</span>
      <button type="button" className="iconpick-trigger" onClick={() => setOpen((o) => !o)}>
        <Current weight="light" /> <small>{value || "escolher"}</small>
      </button>
      {open && (
        <div className="iconpick-grid">
          {iconNames.map((name) => {
            const Ico = getIcon(name);
            return (
              <button type="button" key={name} title={name}
                className={name === value ? "active" : ""}
                onClick={() => { onChange(name); setOpen(false); }}>
                <Ico weight="light" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
