"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Download, Info, X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

// ─── Types ──────────────────────────────────────────────────
interface JobData {
  id: string;
  job_number?: number;
  job_date: string;
  property_type: string;
  owner_type: string;
  storeys: string;
  bedrooms: string;
  multiple_units: boolean;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  suburb: string;
  postcode: string;
  veu_status: string;
  cer_status: string;
  ces_number: string;
  bpc_number: string;
  veu_rebate_value: number;
  cer_rebate_value: number;
  total_price: number;
  additional_notes: string;
  decommission_brand: string;
  decommission_model: string;
  installer_signature: string;
  plumber_signature: string;
  witness_signature: string;
  licensed_electrician_id: string;
  licensed_plumber_id: string;
}

interface Photo { id: string; photo_type: string; url: string; filename: string; }
interface Document { id: string; doc_type: string; url: string; filename: string; }

// ─── Constants ───────────────────────────────────────────────
const TABS = [
  "Job Information",
  "Existing Products",
  "New Products(s)",
  "Compliance",
  "Stakeholders",
  "Forms",
];

const SELECT_CLASS = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const INPUT_CLASS  = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";
const LABEL_CLASS  = "block text-sm font-medium text-gray-700 mb-1.5";

// ─── Photo Upload Component ───────────────────────────────────
function PhotoUpload({ jobId, photoType, label, hint, photos, onUploaded }: {
  jobId: string; photoType: string; label: string; hint?: string;
  photos: Photo[]; onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mine = photos.filter(p => p.photo_type === photoType);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !jobId) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${jobId}/${photoType}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("job-photos").upload(path, file);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("job-photos").getPublicUrl(path);
        await supabase.from("job_photos").insert({
          job_id: jobId, photo_type: photoType,
          storage_path: path, url: urlData.publicUrl, filename: file.name,
        });
      }
    }
    setUploading(false);
    onUploaded();
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = async (photo: Photo) => {
    await supabase.storage.from("job-photos").remove([photo.storage_path || photo.url]);
    await supabase.from("job_photos").delete().eq("id", photo.id);
    onUploaded();
  };

  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-gray-800 mb-1">{label}<span className="text-red-500 ml-0.5">*</span></p>
      {hint && <p className="text-xs text-gray-500 mb-3">{hint}</p>}
      <div className="flex flex-wrap gap-3">
        {mine.map(photo => (
          <div key={photo.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(photo)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition text-xs gap-1"
        >
          {uploading ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <><Upload size={18} /><span>Add</span></>}
        </button>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}

// ─── Document Upload Component ────────────────────────────────
function DocUpload({ jobId, docType, label, hint, docs, onUploaded }: {
  jobId: string; docType: string; label: string; hint?: string;
  docs: Document[]; onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mine = docs.filter(d => d.doc_type === docType);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jobId) return;
    setUploading(true);
    const path = `${jobId}/${docType}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("job-documents").upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("job-documents").getPublicUrl(path);
      await supabase.from("job_documents").insert({
        job_id: jobId, doc_type: docType,
        storage_path: path, url: urlData.publicUrl, filename: file.name,
      });
    }
    setUploading(false);
    onUploaded();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{label}<span className="text-red-500 ml-0.5">*</span></p>
      {hint && <p className="text-xs text-orange-500 mb-2">{hint}</p>}
      {mine.length > 0 ? (
        mine.map(doc => (
          <div key={doc.id} className="flex items-center gap-2 text-sm text-blue-600 mb-1">
            <CheckCircle size={14} className="text-green-500" />
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="underline">{doc.filename}</a>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-400 mb-2 italic">No document uploaded</div>
      )}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-sm text-blue-600 border border-blue-300 rounded-lg px-3 py-2 hover:bg-blue-50 transition"
      >
        {uploading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Upload size={14} />}
        Upload Document
      </button>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
    </div>
  );
}

// ─── Signature Pad Component ──────────────────────────────────
function SigPad({ label, value, onSave }: {
  label: string; value?: string; onSave: (data: string) => void;
}) {
  const ref = useRef<any>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (ref.current && !ref.current.isEmpty()) {
      const data = ref.current.getTrimmedCanvas().toDataURL("image/png");
      onSave(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 relative" style={{ width: 340, height: 140 }}>
        {value ? (
          <>
            <img src={value} alt="signature" className="w-full h-full object-contain" />
            <button
              onClick={() => onSave("")}
              className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <SignatureCanvas
              ref={ref}
              canvasProps={{ width: 310, height: 110, className: "rounded" }}
              penColor="#1a2e5a"
            />
            <div className="flex gap-2 mt-1 justify-end">
              <button onClick={() => ref.current?.clear()} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              <button onClick={handleSave} className="text-xs text-blue-600 font-medium hover:text-blue-800">
                {saved ? "✓ Saved" : "Save"}
              </button>
            </div>
          </>
        )}
        <div className="absolute bottom-3 right-3 text-blue-500">✒</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ManageJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [job, setJob] = useState<Partial<JobData>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchJob();
    fetchPhotos();
    fetchDocs();
    fetchUsers();
  }, [id]);

  const fetchJob = async () => {
    const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
    if (data) setJob(data);
  };

  const fetchPhotos = async () => {
    const { data } = await supabase.from("job_photos").select("*").eq("job_id", id);
    if (data) setPhotos(data);
  };

  const fetchDocs = async () => {
    const { data } = await supabase.from("job_documents").select("*").eq("job_id", id);
    if (data) {
      setDocs(data);
      const form = data.find(d => d.doc_type === "veec_form");
      if (form) setPdfUrl(form.url);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("id, full_name, email, role");
    if (data) setUsers(data);
  };

  const update = (field: string, value: any) => {
    setJob(prev => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("jobs").update(job).eq("id", id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const downloadPhotos = async () => {
    // Open all photos in new tabs for now
    photos.forEach(p => window.open(p.url, "_blank"));
  };

  const hasStakeholderWarning = !job.licensed_electrician_id || !job.licensed_plumber_id;
  const jobTitle = job.job_number || id?.slice(0, 6).toUpperCase();

  return (
    <div className="p-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-[#1a2e5a]">
          Manage Job – {jobTitle}
        </h1>
        <button
          onClick={downloadPhotos}
          className="flex items-center gap-2 bg-[#1a2e5a] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#243a70] transition text-sm"
        >
          <Download size={16} />
          Download All Photos
        </button>
      </div>
      <div className="w-20 h-1 bg-[#c8ff00] rounded mb-8" />

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-3 text-sm font-medium rounded-t-lg transition relative ${
              activeTab === i
                ? "bg-[#1a2e5a] text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab}
            {tab === "Stakeholders" && hasStakeholderWarning && (
              <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Save button (shown on all tabs except Forms) */}
      {activeTab < 5 && (
        <div className="flex justify-end mb-6">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      )}

      {/* ── TAB: Job Information ─────────────────────────────── */}
      {activeTab === 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Job Information</h2>

          <Section title="Activity">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Date *">
                <input type="date" value={job.job_date || ""} onChange={e => update("job_date", e.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="Property Type *">
                <select value={job.property_type || "Residential"} onChange={e => update("property_type", e.target.value)} className={SELECT_CLASS}>
                  <option>Residential</option>
                  <option>Commercial</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Property Details">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Owner Type *">
                <select value={job.owner_type || "Individual"} onChange={e => update("owner_type", e.target.value)} className={SELECT_CLASS}>
                  <option>Individual</option>
                  <option>Company</option>
                  <option>Trust</option>
                </select>
              </Field>
              <Field label="Single or Multi-Storey *">
                <select value={job.storeys || "Single Storey"} onChange={e => update("storeys", e.target.value)} className={SELECT_CLASS}>
                  <option>Single Storey</option>
                  <option>Multi Storey</option>
                </select>
              </Field>
            </div>
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Is there more than one Solar Water Heater/Air Source Heat Pump at this address? *
              </p>
              <div className="flex gap-6">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="multiple_units"
                      value={opt}
                      checked={job.multiple_units === (opt === "Yes")}
                      onChange={() => update("multiple_units", opt === "Yes")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Field label="What is the number of bedrooms in the premise? *">
                <select value={job.bedrooms || "4 or more"} onChange={e => update("bedrooms", e.target.value)} className={SELECT_CLASS}>
                  {["1", "2", "3", "4 or more"].map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Job Type">
                <select value={job.job_type || "Space Heating Cooling"} onChange={e => update("job_type", e.target.value)} className={SELECT_CLASS}>
                  <option>Space Heating Cooling</option>
                  <option>Hot Water Heat Pump VEU & CER</option>
                  <option>Hot Water Heat Pump VEU</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Customer Details *">
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="First Name">
                <input type="text" placeholder="First name" value={job.customer_first_name || ""} onChange={e => update("customer_first_name", e.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="Last Name">
                <input type="text" placeholder="Last name" value={job.customer_last_name || ""} onChange={e => update("customer_last_name", e.target.value)} className={INPUT_CLASS} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-5">
              <Field label="Email">
                <input type="email" placeholder="customer@email.com" value={job.customer_email || ""} onChange={e => update("customer_email", e.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="Phone">
                <input type="text" placeholder="04XX XXX XXX" value={job.customer_phone || ""} onChange={e => update("customer_phone", e.target.value)} className={INPUT_CLASS} />
              </Field>
            </div>
            <div className="mb-5">
              <label className={LABEL_CLASS}>Type Address Here</label>
              <input
                type="text"
                placeholder="Start typing address..."
                value={job.customer_address || ""}
                onChange={e => update("customer_address", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Address">
                <input type="text" value={job.customer_address || ""} onChange={e => update("customer_address", e.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="Suburb / Postcode">
                <div className="flex gap-2">
                  <input type="text" placeholder="Suburb" value={job.suburb || ""} onChange={e => update("suburb", e.target.value)} className={INPUT_CLASS} />
                  <input type="text" placeholder="Postcode" value={job.postcode || ""} onChange={e => update("postcode", e.target.value)} className={INPUT_CLASS + " max-w-28"} />
                </div>
              </Field>
            </div>
          </Section>

          <Section title="VEU / CER Status">
            <div className="grid grid-cols-2 gap-6">
              <Field label="VEU Status">
                <select value={job.veu_status || "Draft"} onChange={e => update("veu_status", e.target.value)} className={SELECT_CLASS}>
                  {["Draft", "Pending", "Veu Submitted", "Regulator Approved", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="CER Status">
                <select value={job.cer_status || "--"} onChange={e => update("cer_status", e.target.value)} className={SELECT_CLASS}>
                  {["--", "Pending", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* ── TAB: Existing Products ───────────────────────────── */}
      {activeTab === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Existing products(s)</h2>

          <Section title="">
            <Field label="Select Scenario">
              <select className={SELECT_CLASS}>
                <option>Scenario 1</option>
                <option>Scenario 2</option>
              </select>
            </Field>
          </Section>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <PhotoUpload
              jobId={id!} photoType="existing_unit" photos={photos} onUploaded={fetchPhotos}
              label="Existing Unit in Service"
              hint="Take clear photos of the existing product before the upgrade in the original position from 2m away and multiple angles"
            />
            <PhotoUpload
              jobId={id!} photoType="compliance_plate" photos={photos} onUploaded={fetchPhotos}
              label="Brand, Model & Serial Number (compliance plate) of the Unit"
              hint="Take a Clear Photo of brand, model and serial number of the decommissioned product"
            />

            <div className="grid grid-cols-2 gap-6 mb-6">
              <Field label="Decommissioning Brand(s)">
                <input type="text" value={job.decommission_brand || ""} onChange={e => update("decommission_brand", e.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="Decommissioning Model(s)">
                <input type="text" value={job.decommission_model || ""} onChange={e => update("decommission_model", e.target.value)} className={INPUT_CLASS} />
              </Field>
            </div>

            <PhotoUpload
              jobId={id!} photoType="manufacture_date" photos={photos} onUploaded={fetchPhotos}
              label="Manufacture Date (Boosted Solar Water Heaters with Non-Functioning Components Only)"
              hint="The date of manufacture of the system showing a date at least 5 years prior to the date of the upgrade"
            />
          </div>
        </div>
      )}

      {/* ── TAB: New Products ────────────────────────────────── */}
      {activeTab === 2 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">New products(s)</h2>

          <Section title="">
            <Field label="Select Scenario">
              <select className={SELECT_CLASS}>
                <option>Scenario 1</option>
                <option>Scenario 2</option>
              </select>
            </Field>
          </Section>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <PhotoUpload
              jobId={id!} photoType="new_product" photos={photos} onUploaded={fetchPhotos}
              label="Photo of installed heat pump"
              hint="Take multiple photos of the new installed heat pump after installation from 2 metres back and from multiple angles including the tank, all pipework and compressor (if applicable)"
            />
            <PhotoUpload
              jobId={id!} photoType="drain_line" photos={photos} onUploaded={fetchPhotos}
              label="Photo of Drain Line"
              hint="Take photos displaying continuous flow of the drain line and the PTR valve line point of discharge (Avoid 90-Degree Bends)"
            />
            <PhotoUpload
              jobId={id!} photoType="wide_angle" photos={photos} onUploaded={fetchPhotos}
              label="Wide Angle Photo of Installed Heat Pump"
              hint="Take a wide angle photo of the new installed heat pump after installation"
            />
            <PhotoUpload
              jobId={id!} photoType="electrical_meter" photos={photos} onUploaded={fetchPhotos}
              label="Photo of Electrical Meter Box"
              hint="Take a photo of the electrical meter box showing the connection"
            />
          </div>
        </div>
      )}

      {/* ── TAB: Compliance ──────────────────────────────────── */}
      {activeTab === 3 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance</h2>

          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="grid grid-cols-2 gap-10">
              {/* Left col */}
              <div>
                <div className="mb-8">
                  <DocUpload
                    jobId={id!} docType="ces_cert" docs={docs} onUploaded={fetchDocs}
                    label="Certificate of Electrical Safety"
                    hint=""
                  />
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Info size={12} /> Please ensure the installation date on the certificate is correct
                  </p>
                </div>
                <div className="mb-8">
                  <DocUpload
                    jobId={id!} docType="bpc_cert" docs={docs} onUploaded={fetchDocs}
                    label="BPC Certificate"
                    hint="If decommissioning a gas product, an additional BPC will be required if the plumber installing the new product is not licensed for gas-fitting. Please also ensure the installation date on the certificate is correct"
                  />
                </div>
                <div className="mb-8">
                  <DocUpload
                    jobId={id!} docType="customer_invoice" docs={docs} onUploaded={fetchDocs}
                    label="Customer Invoice"
                    hint=""
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Please ensure the correct model number is listed on the invoice and the price of product & labour and consumer payment listed on the invoice matches the figures listed below.
                  </p>
                </div>

                <Field label="Value of VEU Rebate provided to customer: *">
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2.5 text-sm text-gray-500">$</span>
                    <input type="number" value={job.veu_rebate_value || ""} onChange={e => update("veu_rebate_value", e.target.value)} className={INPUT_CLASS + " rounded-l-none"} />
                  </div>
                </Field>
                <div className="mt-4">
                  <Field label="Value of CER Rebate provided to customer: *">
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2.5 text-sm text-gray-500">$</span>
                      <input type="number" value={job.cer_rebate_value || ""} onChange={e => update("cer_rebate_value", e.target.value)} className={INPUT_CLASS + " rounded-l-none"} />
                    </div>
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Price of installed product(s), labour and additional items including GST (before VEU incentive) *">
                    <p className="text-xs text-gray-400 mb-1">This figure should be identical to the customer invoice before VEU discount</p>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2.5 text-sm text-gray-500">$</span>
                      <input type="number" value={job.total_price || ""} onChange={e => update("total_price", e.target.value)} className={INPUT_CLASS + " rounded-l-none"} />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Right col */}
              <div>
                <div className="mb-8">
                  <label className={LABEL_CLASS}>
                    CoES Number * <span className="font-normal text-gray-500">(Certificate of Electrical Safety)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-1">Enter Number</p>
                  <input type="text" value={job.ces_number || ""} onChange={e => update("ces_number", e.target.value)} className={INPUT_CLASS} />
                </div>
                <div className="mb-8">
                  <label className={LABEL_CLASS}>
                    BPC Certificate Number * <span className="font-normal text-gray-500">(Building Plumbing Commission)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-1">Enter the Building Plumbing Commission (BPC) Certificate Number for the installed unit</p>
                  <p className="text-xs text-gray-400 mb-1">Enter Number</p>
                  <input type="text" value={job.bpc_number || ""} onChange={e => update("bpc_number", e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>
                    Additional Information
                  </label>
                  <p className="text-xs text-gray-400 mb-1">
                    (e.g. explain reasons as to why CoES and BPC completions dates do not match / completion dates on certificates do not match photographs)
                  </p>
                  <textarea
                    rows={5}
                    value={job.additional_notes || ""}
                    onChange={e => update("additional_notes", e.target.value)}
                    className={INPUT_CLASS + " resize-none"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Stakeholders ────────────────────────────────── */}
      {activeTab === 4 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Stakeholders</h2>

          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h3 className="text-base font-bold text-gray-800 mb-6">Workers</h3>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <Field label="Licensed Electrician *">
                  <select
                    value={job.licensed_electrician_id || ""}
                    onChange={e => update("licensed_electrician_id", e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="">Select...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} – {u.email}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="mt-5">
                  <Field label="Licensed Plumber *">
                    <select
                      value={job.licensed_plumber_id || ""}
                      onChange={e => update("licensed_plumber_id", e.target.value)}
                      className={SELECT_CLASS}
                    >
                      <option value="">Select...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} – {u.email}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-5">
                  <Field label="Registered Plumber">
                    <select className={SELECT_CLASS}>
                      <option value="">Select</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} – {u.email}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div>
                <SigPad
                  label="Installer Signature"
                  value={job.installer_signature}
                  onSave={v => update("installer_signature", v)}
                />
                <SigPad
                  label=""
                  value={job.plumber_signature}
                  onSave={v => update("plumber_signature", v)}
                />
                <SigPad
                  label="Witness Signature"
                  value={job.witness_signature}
                  onSave={v => update("witness_signature", v)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Forms ───────────────────────────────────────── */}
      {activeTab === 5 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Forms</h2>

          <div className="mb-4">
            <DocUpload
              jobId={id!} docType="veec_form" docs={docs} onUploaded={fetchDocs}
              label="Upload VEEC Assignment Form (PDF)"
              hint=""
            />
          </div>

          {pdfUrl ? (
            <div className="bg-gray-900 rounded-xl overflow-hidden" style={{ height: "80vh" }}>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 text-white text-sm border-b border-gray-700">
                <span className="truncate flex-1">
                  {docs.find(d => d.doc_type === "veec_form")?.filename || "VEEC Assignment Form"}
                </span>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">
                  <Download size={16} />
                </a>
              </div>
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="VEEC Form"
              />
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No form uploaded yet</p>
              <p className="text-sm mt-1">Upload a VEEC Assignment Form PDF above to preview it here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      {title && <h3 className="text-base font-bold text-gray-800 mb-5">{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
