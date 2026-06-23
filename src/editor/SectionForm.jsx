import React, { useState } from "react";
import { CaretDown, CaretRight, GearSix, Plus, Trash } from "@phosphor-icons/react";
import { setIn, addItem, removeItem, emptyItem } from "../data/proposalOps.js";
import { TextField, NumberField, ImageDrop, IconPicker } from "./fields.jsx";

// Texto curto que identifica um item da lista quando colapsado (título, cargo, etc).
function itemPreview(item) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const v = item.title || item.role || item.label || item.num || "";
    return typeof v === "string" ? v.replace(/\n/g, " ") : "";
  }
  return "";
}

function getIn(obj, path) {
  return path.reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

// Renderiza um campo simples. `basePath` é o caminho até o objeto que contém `field.path`.
function Field({ field, data, basePath, onChange }) {
  const path = [...basePath, ...field.path];
  const value = getIn(data, path);
  const set = (v) => onChange(setIn(data, path, v));
  switch (field.type) {
    case "text": return <TextField label={field.label} value={value} onChange={set} />;
    case "textarea": return <TextField label={field.label} value={value} onChange={set} textarea />;
    case "number": return <NumberField label={field.label} value={value} onChange={set} />;
    case "image": return <ImageDrop label={field.label} value={value} onChange={set} />;
    case "icon": return <IconPicker label={field.label} value={value} onChange={set} />;
    case "list": return <ListField field={field} data={data} basePath={basePath} onChange={onChange} />;
    default: return null;
  }
}

// Lista repetível com adicionar / remover. Cada item é COLAPSÁVEL (fechado por
// padrão, abre pela seta). Item recém-adicionado abre automaticamente. Suporta
// itens objeto e itens string (itemFields com path []), e aninhamento.
function ListField({ field, data, basePath, onChange }) {
  const listPath = [...basePath, ...field.path];
  const items = getIn(data, listPath) || [];
  const [openSet, setOpenSet] = useState(() => new Set());

  const toggle = (i) =>
    setOpenSet((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const add = () => {
    onChange(addItem(data, listPath, emptyItem(field.itemType)));
    setOpenSet((s) => new Set(s).add(items.length)); // abre o novo item
  };
  const remove = (i) => {
    onChange(removeItem(data, listPath, i));
    setOpenSet((s) => { // reindexa os abertos após a remoção
      const n = new Set();
      for (const x of s) { if (x < i) n.add(x); else if (x > i) n.add(x - 1); }
      return n;
    });
  };

  return (
    <div className="listfld">
      <div className="listfld-head">
        <span>{field.label}</span>
        <button type="button" onClick={add}><Plus weight="bold" size={12} /> adicionar</button>
      </div>
      {items.map((item, i) => {
        const open = openSet.has(i);
        const preview = itemPreview(item);
        return (
          <div className={"listfld-item" + (open ? " open" : "")} key={i}>
            <div className="listfld-item-head">
              <button type="button" className="listfld-item-toggle" onClick={() => toggle(i)}>
                <CaretRight className="li-caret" weight="bold" size={13} />
                <small>{field.label} {i + 1}</small>
                {preview && <em className="li-preview">{preview}</em>}
              </button>
              <button type="button" className="rm" onClick={() => remove(i)}><Trash weight="bold" size={12} /> remover</button>
            </div>
            {open && (
              <div className="listfld-item-body">
                {field.itemFields.map((f, k) => (
                  <Field key={k} field={f} data={data} basePath={[...listPath, i]} onChange={onChange} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SectionForm({ section, data, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"acc" + (open ? " open" : "")}>
      <button type="button" className="acc-head" onClick={() => setOpen((o) => !o)}>
        {section.num
          ? <span className="acc-num">{section.num}</span>
          : <span className="acc-num acc-num--gear"><GearSix weight="fill" size={14} /></span>}
        <span className="acc-title">{section.title}</span>
        <span className="acc-dot" aria-hidden="true" />
        <CaretDown className="acc-caret" weight="bold" size={15} />
      </button>
      {open && (
        <div className="acc-body">
          {section.fields.map((f, i) => (
            <Field key={i} field={f} data={data} basePath={[]} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}
