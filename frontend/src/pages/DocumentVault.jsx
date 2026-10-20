import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import api, { apiUrl } from "../api";
import { apiError, formatDateTime, listOf } from "../lib/format";
import { useNotificationStore } from "../store/notificationStore";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import Field, { Input, Select } from "../components/ui/Field";
import Panel from "../components/ui/Panel";
import { SkeletonPanel } from "../components/ui/Skeleton";
import StatusTag from "../components/ui/StatusTag";

const CATEGORIES = [
  ["lease", "Lease agreement"],
  ["id", "Identification"],
  ["contract", "Contract"],
  ["other", "Other"],
];

const CATEGORY_TONE = {
  lease: "pine",
  id: "ink",
  contract: "brass",
  other: "ink",
};

export default function DocumentVault() {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [documents, setDocuments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "lease",
    property: "",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [docs, props] = await Promise.allSettled([
      api.get("/documents/"),
      api.get("/properties/my_properties/"),
    ]);
    setDocuments(docs.status === "fulfilled" ? listOf(docs.value.data) : []);
    setProperties(props.status === "fulfilled" ? listOf(props.value.data) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function upload(e) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("title", form.title.trim() || file.name);
      payload.append("category", form.category);
      if (form.property) payload.append("property", form.property);
      await api.post("/documents/", payload);
      showNotification("Document filed in the vault.", "success");
      setUploadOpen(false);
      setForm({ title: "", category: "lease", property: "" });
      setFile(null);
      await load();
    } catch (err) {
      setError(apiError(err, "The document could not be uploaded."));
    } finally {
      setSaving(false);
    }
  }

  async function download(doc) {
    setDownloadingId(doc.id);
    try {
      const res = await api.get(`/documents/${doc.id}/download/`, {
        responseType: "blob",
        skipAuthReset: true,
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file?.split("/").pop() || `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Direct media link as a fallback; /media is not cookie-protected.
      if (doc.file) window.open(apiUrl(doc.file.replace(/^https?:\/\/[^/]+/, "")), "_blank");
      else showNotification("Download failed.", "error");
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return <SkeletonPanel rows={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[28px] font-semibold text-ink-900">
            Document vault
          </h2>
          <p className="mt-1 text-[14px] text-ink-400">
            Generated PDF invoices and anything else you file against a property.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload document
        </Button>
      </div>

      <Panel title="Filed documents" subtitle={`${documents.length} item${documents.length === 1 ? "" : "s"}`} padding="p-0">
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="The vault is empty"
            description="Confirm a booking and its PDF invoice is rendered and filed here automatically. You can also upload leases and contracts."
            action={
              <Button variant="secondary" size="sm" onClick={() => setUploadOpen(true)}>
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Upload a document
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-crete-200">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors hover:bg-crete-100"
              >
                <FileText
                  className="h-4.5 w-4.5 shrink-0 text-ink-400"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-ink-800">
                    {doc.title}
                  </p>
                  <p className="num text-[12px] text-ink-400">
                    {formatDateTime(doc.uploaded_at)}
                  </p>
                </div>
                <StatusTag tone={CATEGORY_TONE[doc.category] || "ink"}>
                  {CATEGORIES.find(([v]) => v === doc.category)?.[1] || doc.category}
                </StatusTag>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={downloadingId === doc.id}
                  onClick={() => download(doc)}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload a document"
        subtitle="Filed against a property so residents can reach it."
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="upload-doc" loading={saving}>
              Upload
            </Button>
          </>
        }
      >
        <form id="upload-doc" onSubmit={upload} className="space-y-4">
          <Field label="File" htmlFor="doc_file" error={error}>
            <Input
              id="doc_file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file:mr-3 file:rounded-[3px] file:border file:border-crete-300 file:bg-crete-100 file:px-2.5 file:py-1 file:text-[12.5px] file:text-ink-600"
              required
            />
          </Field>
          <Field label="Title" htmlFor="doc_title" hint="Defaults to the file name.">
            <Input
              id="doc_title"
              value={form.title}
              onChange={set("title")}
              placeholder="Lease — Unit 101A"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="doc_category">
              <Select
                id="doc_category"
                value={form.category}
                onChange={set("category")}
              >
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Property" htmlFor="doc_property">
              <Select
                id="doc_property"
                value={form.property}
                onChange={set("property")}
              >
                <option value="">Unassigned</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
