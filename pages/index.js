import React, { useState } from 'react';
import { Upload, Send, Check, AlertCircle, HelpCircle } from 'lucide-react';

// Products that use the concentration + volume dosing path
const CONC_VOLUME_PRODUCTS = ['Testosterone Cypionate', 'Testosterone Cream', 'Estradiol Cream', 'Bi-Est Cream'];

// Tooltip defined at top level (NOT inside Home) so it doesn't remount on every
// keystroke and reset its open/closed state.
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="inline-block ml-1 text-blue-500 hover:text-blue-700 align-middle"
      >
        <HelpCircle size={16} />
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 w-60 bg-blue-50 border border-blue-200 rounded p-2 text-xs text-gray-700 z-10">
          {text}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    requestType: 'existing-followup',
    clinicalReason: '',
    // Testosterone
    testosteroneForm: '',
    testosteroneEntryMode: 'conc', // 'conc' or 'mg'
    testosteroneConc: '',
    testosteroneAmount: '',
    testosteroneAmountUnit: 'units',
    testosteroneMg: '',
    testosteroneFrequency: '',
    testosteroneLastDose: '',
    // Progesterone
    progesteroneForm: '',
    progesteroneDose: '',
    progesteroneFrequency: '',
    progesteroneLastDose: '',
    // Estradiol
    estradiolForm: '',
    estradiolEntryMode: 'conc',
    estradiolConc: '',
    estradiolAmount: '',
    estradiolAmountUnit: 'units',
    estradiolMg: '',
    estradiolFrequency: '',
    estradiolLastDose: '',
    // Thyroid
    thyroidForm: '',
    thyroidDose: '',
    thyroidFrequency: '',
    thyroidLastDose: '',
    // Other
    otherMeds: '',
    // Clinical Status
    overallStatus: 'stable',
    currentSymptoms: '',
    newSymptoms: '',
    sideEffects: '',
    patientGoals: '',
    // Reproductive Status
    isMenopausal: '',
    menoNoMenses: false,
    menoFSH: false,
    menoLH: false,
    menoEstradiol: false,
    menoAge: false,
    cycleRegularity: '',
    lastMenstrualPeriod: '',
    // Labs
    labsAttached: false,
    abnormalFindings: '',
    files: []
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const isExisting = formData.requestType === 'existing-followup';
  const testUsesConcVolume = CONC_VOLUME_PRODUCTS.includes(formData.testosteroneForm);
  const estUsesConcVolume = CONC_VOLUME_PRODUCTS.includes(formData.estradiolForm);

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name required';
    if (!formData.patientAge.trim()) newErrors.patientAge = 'Patient age required';
    if (!formData.requestType) newErrors.requestType = 'Request type required';
    if (!formData.currentSymptoms.trim()) newErrors.currentSymptoms = 'Current symptoms status required';
    if (!formData.overallStatus) newErrors.overallStatus = 'Overall status required';
    if (!formData.isMenopausal) newErrors.isMenopausal = 'Please indicate menopausal status';

    if (formData.isMenopausal === 'no' && !formData.cycleRegularity) {
      newErrors.cycleRegularity = 'Please indicate cycle regularity';
    }
    if (formData.isMenopausal === 'no' && !formData.lastMenstrualPeriod.trim()) {
      newErrors.lastMenstrualPeriod = 'LMP date required for cycling patients';
    }

    if (isExisting) {
      const hasTest = formData.testosteroneForm && (formData.testosteroneMg || formData.testosteroneAmount || formData.testosteroneConc);
      const hasProg = formData.progesteroneForm && formData.progesteroneDose;
      const hasEst = formData.estradiolForm && (formData.estradiolMg || formData.estradiolAmount || formData.estradiolConc);
      const hasThy = formData.thyroidForm && formData.thyroidDose;
      if (!hasTest && !hasProg && !hasEst && !hasThy && !formData.otherMeds.trim()) {
        newErrors.regimen = 'Must document current regimen for a medication adjustment';
      }
    }

    if (formData.files.length === 0) newErrors.labsAttached = 'Lab results must be added';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const TO_EMAIL = 'darrell2@4everyoungkingwoodtx.com';

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = validateForm();
    if (valid) {
      setSubmitted(true);
      setCopied(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to the first field with an error so the user sees what's missing
      setTimeout(() => {
        const firstError = document.querySelector('[data-error="true"]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  const subjectText = () => `Consultation Request: ${formData.patientName}`;

  const gmailUrl = () => {
    const body = encodeURIComponent(generateEmailBody());
    const su = encodeURIComponent(subjectText());
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TO_EMAIL)}&su=${su}&body=${body}`;
  };

  const outlookUrl = () => {
    const body = encodeURIComponent(generateEmailBody());
    const su = encodeURIComponent(subjectText());
    return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(TO_EMAIL)}&subject=${su}&body=${body}`;
  };

  const mailtoUrl = () => {
    const body = encodeURIComponent(generateEmailBody());
    const su = encodeURIComponent(subjectText());
    return `mailto:${TO_EMAIL}?subject=${su}&body=${body}`;
  };

  const copyRequestText = async () => {
    try {
      await navigator.clipboard.writeText(generateEmailBody());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = generateEmailBody();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Human-readable labels for the error summary
  const errorLabels = {
    patientName: 'Patient name',
    patientAge: 'Patient age',
    requestType: 'Request type',
    currentSymptoms: 'Current symptoms',
    overallStatus: 'Overall status',
    isMenopausal: 'Menopausal status',
    cycleRegularity: 'Cycle regularity',
    lastMenstrualPeriod: 'Last menstrual period',
    regimen: 'Current regimen',
    labsAttached: 'Lab results upload'
  };

  // Build a dose description for a conc/volume hormone
  const concVolumeDose = (form, mode, conc, amount, unit, mg) => {
    if (CONC_VOLUME_PRODUCTS.includes(form)) {
      if (mode === 'mg' && mg) return `${mg} mg`;
      if (mode === 'conc' && (conc || amount)) {
        return `${amount} ${unit} of ${conc}`;
      }
    }
    return mg || amount || '';
  };

  const hormoneLine = (label, form, doseDesc, freq, lastDose) => {
    if (!form) return `${label}: Not documented`;
    let line = `${label}: ${form}`;
    if (doseDesc) line += `, ${doseDesc}`;
    if (freq) line += `, ${freq}`;
    if (isExisting && lastDose) line += ` | Last dose before labs: ${lastDose}`;
    return line;
  };

  const generateEmailBody = () => {
    const menoIndicators = [];
    if (formData.menoNoMenses) menoIndicators.push('No menses >1 year');
    if (formData.menoFSH) menoIndicators.push('FSH >50');
    if (formData.menoLH) menoIndicators.push('LH >30');
    if (formData.menoEstradiol) menoIndicators.push('Estradiol <30');
    if (formData.menoAge) menoIndicators.push('Age >52');

    let reproSection = '';
    if (formData.isMenopausal === 'yes') {
      reproSection = `Status: Menopausal\nConfirmation indicators present: ${menoIndicators.length ? menoIndicators.join(', ') : 'None specified'}`;
    } else if (formData.isMenopausal === 'no') {
      reproSection = `Status: Still cycling\nCycle regularity: ${formData.cycleRegularity}\nLast menstrual period: ${formData.lastMenstrualPeriod}`;
    } else if (formData.isMenopausal === 'na') {
      reproSection = `Status: Not applicable (male patient)`;
    } else {
      reproSection = `Status: Uncertain`;
    }

    const testDose = concVolumeDose(formData.testosteroneForm, formData.testosteroneEntryMode, formData.testosteroneConc, formData.testosteroneAmount, formData.testosteroneAmountUnit, formData.testosteroneMg);
    const estDose = concVolumeDose(formData.estradiolForm, formData.estradiolEntryMode, formData.estradiolConc, formData.estradiolAmount, formData.estradiolAmountUnit, formData.estradiolMg);

    return `CONSULTATION REQUEST - PRECISION HORMONE CONSULTING

REQUEST TYPE: ${formData.requestType === 'new-patient' ? 'NEW PATIENT - Full BHRT Analysis' : 'EXISTING BHRT PATIENT - Medication Adjustment'}

PATIENT INFORMATION:
Name: ${formData.patientName}
Age: ${formData.patientAge}
Clinical Reason: ${formData.clinicalReason || '(not specified)'}

${isExisting ? `CURRENT REGIMEN:
${hormoneLine('Testosterone', formData.testosteroneForm, testDose, formData.testosteroneFrequency, formData.testosteroneLastDose)}
${hormoneLine('Progesterone', formData.progesteroneForm, formData.progesteroneDose, formData.progesteroneFrequency, formData.progesteroneLastDose)}
${hormoneLine('Estradiol', formData.estradiolForm, estDose, formData.estradiolFrequency, formData.estradiolLastDose)}
${hormoneLine('Thyroid', formData.thyroidForm, formData.thyroidDose, formData.thyroidFrequency, formData.thyroidLastDose)}
Other Medications/Supplements: ${formData.otherMeds || 'None documented'}
` : `NEW PATIENT - no current BHRT regimen (full analysis requested)
Current medications/supplements: ${formData.otherMeds || 'None documented'}
`}
CLINICAL STATUS:
Overall Status: ${formData.overallStatus}
Current Symptoms: ${formData.currentSymptoms}
New Symptoms: ${formData.newSymptoms || 'None reported'}
Side Effects: ${formData.sideEffects || 'None reported'}
Patient Goals: ${formData.patientGoals || 'Not specified'}

REPRODUCTIVE / HORMONAL STATUS:
${reproSection}

LAB FINDINGS:
Abnormal/Notable Results: ${formData.abnormalFindings || 'See attached labs'}

EXPECTED ATTACHMENTS (staff to attach to this email): ${formData.files.length ? formData.files.map(f => f.name).join(', ') : 'None added'}

NOTE: Lab results and supporting documents should be attached to this email before sending.`;
  };

  // Reusable conc/volume dose entry block (plain function, NOT a component,
  // so inputs don't remount and lose focus on each keystroke)
  const renderConcVolumeEntry = (prefix) => {
    const mode = formData[`${prefix}EntryMode`];
    return (
      <div className="col-span-full">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-xs font-semibold text-slate-700">Dose entry method:</span>
          <label className="flex items-center text-sm">
            <input type="radio" name={`${prefix}EntryMode`} value="conc"
              checked={mode === 'conc'}
              onChange={(e) => set(`${prefix}EntryMode`, e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <span className="ml-1.5 text-slate-700">Concentration + amount</span>
          </label>
          <label className="flex items-center text-sm">
            <input type="radio" name={`${prefix}EntryMode`} value="mg"
              checked={mode === 'mg'}
              onChange={(e) => set(`${prefix}EntryMode`, e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <span className="ml-1.5 text-slate-700">Direct mg</span>
          </label>
        </div>

        {mode === 'conc' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Concentration</label>
              <input type="text" value={formData[`${prefix}Conc`]}
                onChange={(e) => set(`${prefix}Conc`, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., '200 mg/mL', '100 mg/mL'" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Amount per dose</label>
              <input type="text" value={formData[`${prefix}Amount`]}
                onChange={(e) => set(`${prefix}Amount`, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., '20'" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center">
                Unit
                <Tooltip text="Choose carefully: on an insulin syringe, 1 unit = 0.01 mL. So 20 units of 200 mg/mL = 0.2 mL = 40 mg. '20 mL' of cypionate would be a huge red flag - pick the unit that matches what the patient actually does." />
              </label>
              <select value={formData[`${prefix}AmountUnit`]}
                onChange={(e) => set(`${prefix}AmountUnit`, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="units">units (insulin syringe)</option>
                <option value="mL">mL</option>
                <option value="clicks">clicks (pump)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Dose (mg)</label>
              <input type="text" value={formData[`${prefix}Mg`]}
                onChange={(e) => set(`${prefix}Mg`, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., '40 mg'" />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex justify-center mb-4">
              <Check size={56} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Almost done — 2 steps left</h2>
            <p className="text-gray-600 mb-6 text-center">
              Your request for <strong>{formData.patientName}</strong> is ready. Follow these two steps to send it to Dr. Wilcox.
            </p>

            {/* Step 1 */}
            <div className="mb-5 p-4 border border-slate-200 rounded-lg">
              <p className="font-semibold text-slate-800 mb-3">
                <span className="inline-flex w-6 h-6 rounded-full bg-blue-600 text-white items-center justify-center text-xs mr-2">1</span>
                Open a pre-filled email
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={outlookUrl()} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition">
                  Open in Outlook
                </a>
                <a href={gmailUrl()} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg transition">
                  Open in Gmail
                </a>
              </div>
              <button onClick={copyRequestText}
                className="w-full mt-3 text-center border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition">
                {copied ? 'Copied! Paste into a new email' : 'Or copy request text to paste manually'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                The email opens addressed to <strong>{TO_EMAIL}</strong> with everything filled in.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <p className="font-semibold text-amber-900 mb-2">
                <span className="inline-flex w-6 h-6 rounded-full bg-amber-500 text-white items-center justify-center text-xs mr-2">2</span>
                Attach the lab file(s) to that email before sending
              </p>
              {formData.files.length > 0 ? (
                <div className="text-sm text-amber-900">
                  <p className="mb-1">Attach these file(s):</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {formData.files.map((file, i) => (
                      <li key={i} className="font-medium">{file.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-amber-900">Attach the patient's lab results PDF.</p>
              )}
              <p className="text-xs text-amber-800 mt-2">
                Note: the files you selected on the form can't be carried into the email automatically — please drag them in from your computer.
              </p>
            </div>

            <button
              onClick={() => { setSubmitted(false); setErrors({}); window.scrollTo({ top: 0 }); }}
              className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition"
            >
              Start Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            Medical Director Consultation Request
          </h1>
          <p className="text-gray-600">Precision Hormone Consulting</p>
          <p className="text-sm text-gray-500 mt-2">
            Complete all required fields (<span className="text-red-500">*</span>) to ensure Dr. Wilcox has the information needed for a thorough clinical recommendation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">

          {/* Section 1: Patient Information */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">1</span>
              Patient Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formData.patientName}
                  onChange={(e) => set('patientName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.patientName ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Full name" />
                {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Patient Age <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formData.patientAge}
                  onChange={(e) => set('patientAge', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.patientAge ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="e.g., 54" />
                {errors.patientAge && <p className="text-red-500 text-xs mt-1">{errors.patientAge}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select value={formData.requestType}
                  onChange={(e) => set('requestType', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requestType ? 'border-red-500' : 'border-slate-300'}`}>
                  <option value="existing-followup">Existing BHRT Patient - Medication Adjustment</option>
                  <option value="new-patient">New Patient - Full BHRT Analysis</option>
                </select>
                {errors.requestType && <p className="text-red-500 text-xs mt-1">{errors.requestType}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Clinical Reason for Request
                </label>
                <input type="text" value={formData.clinicalReason}
                  onChange={(e) => set('clinicalReason', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 'Follow-up labs in, reviewing for adjustment'" />
              </div>
            </div>
          </div>

          {/* Section 2: Current Regimen (existing only) */}
          {isExisting && (
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">2</span>
                Current Regimen
                <Tooltip text="Document exactly what the patient takes. For injectables and creams, concentration plus the amount/unit injected is essential. Last-dose timing before labs tells us peak vs trough vs mid-range." />
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Document exactly what the patient is currently taking, and when each was last dosed prior to the blood draw.
              </p>

              {/* Testosterone */}
              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Testosterone</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Formulation</label>
                    <select value={formData.testosteroneForm}
                      onChange={(e) => set('testosteroneForm', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="Testosterone Cypionate">Testosterone Cypionate</option>
                      <option value="Testosterone Cream">Testosterone Cream</option>
                      <option value="Oral Testosterone Capsules">Oral Testosterone Capsules</option>
                      <option value="Testosterone Troches">Testosterone Troches</option>
                      <option value="Testosterone Pellet">Testosterone Pellet</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                    <input type="text" value={formData.testosteroneFrequency}
                      onChange={(e) => set('testosteroneFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'SQ weekly', 'twice weekly', 'q3 months'" />
                  </div>
                </div>

                {testUsesConcVolume ? (
                  <div className="mb-4">{renderConcVolumeEntry('testosterone')}</div>
                ) : formData.testosteroneForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Dose (mg)</label>
                      <input type="text" value={formData.testosteroneMg}
                        onChange={(e) => set('testosteroneMg', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., '100 mg', '600 mg pellets'" />
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.testosteroneLastDose}
                      onChange={(e) => set('testosteroneLastDose', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '3 days prior', '6/5 8am'" />
                  </div>
                </div>
              </div>

              {/* Progesterone */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Progesterone</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Type</label>
                    <select value={formData.progesteroneForm}
                      onChange={(e) => set('progesteroneForm', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="Oral - compounded">Oral - compounded</option>
                      <option value="Oral - retail">Oral - retail</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                    <input type="text" value={formData.progesteroneDose}
                      onChange={(e) => set('progesteroneDose', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '100 mg', '200 mg'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                    <input type="text" value={formData.progesteroneFrequency}
                      onChange={(e) => set('progesteroneFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'qHS', 'days 15-28'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.progesteroneLastDose}
                      onChange={(e) => set('progesteroneLastDose', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'last night', '6/5 10pm'" />
                  </div>
                </div>
              </div>

              {/* Estradiol */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Estradiol</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Formulation</label>
                    <select value={formData.estradiolForm}
                      onChange={(e) => set('estradiolForm', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="Oral Estradiol Capsules">Oral Estradiol Capsules</option>
                      <option value="Estradiol Cream">Estradiol Cream</option>
                      <option value="Estradiol Patch">Estradiol Patch</option>
                      <option value="Estradiol Pellet">Estradiol Pellet</option>
                      <option value="Bi-Est Capsules">Bi-Est Capsules</option>
                      <option value="Bi-Est Cream">Bi-Est Cream</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                    <input type="text" value={formData.estradiolFrequency}
                      onChange={(e) => set('estradiolFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'daily', 'BID', 'q3 months'" />
                  </div>
                </div>

                {estUsesConcVolume ? (
                  <div className="mb-4">{renderConcVolumeEntry('estradiol')}</div>
                ) : formData.estradiolForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                      <input type="text" value={formData.estradiolMg}
                        onChange={(e) => set('estradiolMg', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., '1 mg', '0.05 mg/day patch', '4 mg pellet'" />
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.estradiolLastDose}
                      onChange={(e) => set('estradiolLastDose', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'morning of', '6/5 7am'" />
                  </div>
                </div>
              </div>

              {/* Thyroid */}
              <div className="bg-teal-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                  Thyroid
                  <Tooltip text="Last-dose timing matters especially for T3-containing desiccated products. Note if held the morning of the draw." />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Agent</label>
                    <select value={formData.thyroidForm}
                      onChange={(e) => set('thyroidForm', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="Desiccated Thyroid">Desiccated Thyroid</option>
                      <option value="NP Thyroid">NP Thyroid</option>
                      <option value="Armour Thyroid">Armour Thyroid</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                    <input type="text" value={formData.thyroidDose}
                      onChange={(e) => set('thyroidDose', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '60 mg', '1 grain', '88 mcg'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                    <input type="text" value={formData.thyroidFrequency}
                      onChange={(e) => set('thyroidFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'daily AM', 'BID'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.thyroidLastDose}
                      onChange={(e) => set('thyroidLastDose', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'held AM of draw', '6/5 6am'" />
                  </div>
                </div>
              </div>

              {/* Other Medications */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Other Medications / Supplements
                </label>
                <textarea value={formData.otherMeds}
                  onChange={(e) => set('otherMeds', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="3"
                  placeholder="DHEA, pregnenolone, DIM, oxytocin, peptides, anastrozole, hCG, etc." />
              </div>

              {errors.regimen && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  {errors.regimen}
                </div>
              )}
            </div>
          )}

          {/* New patient meds section */}
          {!isExisting && (
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">2</span>
                Current Medications & Supplements
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                This is a new patient for full BHRT analysis. List any current medications, hormones, or supplements they're already taking (or note "none").
              </p>
              <textarea value={formData.otherMeds}
                onChange={(e) => set('otherMeds', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="4"
                placeholder="Any current prescriptions, OTC hormones, thyroid medication, supplements, etc. - or 'none'" />
            </div>
          )}

          {/* Section 3: Clinical Status */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">3</span>
              Clinical Status
              <Tooltip text="These details tell Dr. Wilcox whether the current approach is working or needs adjustment - symptoms and labs are interpreted together." />
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Overall Status {isExisting ? 'Since Last Adjustment' : 'at Presentation'} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {['improved', 'stable', 'worse'].map(status => (
                  <label key={status} className="flex items-center">
                    <input type="radio" name="overallStatus" value={status}
                      checked={formData.overallStatus === status}
                      onChange={(e) => set('overallStatus', e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-slate-700 capitalize">{status}</span>
                  </label>
                ))}
              </div>
              {errors.overallStatus && <p className="text-red-500 text-xs mt-2">{errors.overallStatus}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Current Symptoms (or "asymptomatic") <span className="text-red-500">*</span>
              </label>
              <textarea value={formData.currentSymptoms}
                onChange={(e) => set('currentSymptoms', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.currentSymptoms ? 'border-red-500' : 'border-slate-300'}`}
                rows="3"
                placeholder="e.g., 'asymptomatic' or 'hot flashes 5-10/day, low libido, fatigue, sleep improved'" />
              {errors.currentSymptoms && <p className="text-red-500 text-xs mt-1">{errors.currentSymptoms}</p>}
              <p className="text-xs text-gray-600 mt-2">Include what's working and what's not - symptoms + labs together drive the recommendation.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Symptoms Since Last Visit</label>
              <textarea value={formData.newSymptoms}
                onChange={(e) => set('newSymptoms', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="Any new issues that have emerged - or 'none'" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Side Effects or Tolerability Issues</label>
              <textarea value={formData.sideEffects}
                onChange={(e) => set('sideEffects', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="Any negative effects from current regimen - or 'none reported'" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Patient's Goals or Concerns</label>
              <textarea value={formData.patientGoals}
                onChange={(e) => set('patientGoals', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="What does the patient hope to achieve or what are they concerned about?" />
            </div>
          </div>

          {/* Section 4: Reproductive / Hormonal Status */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">4</span>
              Reproductive / Hormonal Status
              <Tooltip text="Menopausal status and cycle phase at the time of the blood draw fundamentally affect interpretation of female hormone labs." />
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Is the patient menopausal? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'yes', label: 'Yes - menopausal' },
                  { value: 'no', label: 'No - still cycling' },
                  { value: 'na', label: 'N/A - male patient' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input type="radio" name="isMenopausal" value={option.value}
                      checked={formData.isMenopausal === option.value}
                      onChange={(e) => set('isMenopausal', e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.isMenopausal && <p className="text-red-500 text-xs mt-2">{errors.isMenopausal}</p>}
            </div>

            {formData.isMenopausal === 'yes' && (
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Which menopause confirmation indicators are present? (check all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'menoNoMenses', label: 'No menses for >1 year' },
                    { key: 'menoFSH', label: 'FSH >50' },
                    { key: 'menoLH', label: 'LH >30' },
                    { key: 'menoEstradiol', label: 'Estradiol <30' },
                    { key: 'menoAge', label: 'Age >52' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center">
                      <input type="checkbox" checked={formData[item.key]}
                        onChange={(e) => set(item.key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded" />
                      <span className="ml-2 text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.isMenopausal === 'no' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Menstrual cycle regularity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    {[
                      { value: 'regular', label: 'Regular cycles' },
                      { value: 'irregular', label: 'Irregular cycles' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input type="radio" name="cycleRegularity" value={option.value}
                          checked={formData.cycleRegularity === option.value}
                          onChange={(e) => set('cycleRegularity', e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-slate-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.cycleRegularity && <p className="text-red-500 text-xs mt-2">{errors.cycleRegularity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    First day of last menstrual period <span className="text-red-500">*</span>
                    <Tooltip text="The cycle day at the time of the blood draw determines which phase (follicular/luteal) the hormone levels represent." />
                  </label>
                  <input type="text" value={formData.lastMenstrualPeriod}
                    onChange={(e) => set('lastMenstrualPeriod', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastMenstrualPeriod ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="e.g., '2026-05-28' or 'May 28'" />
                  {errors.lastMenstrualPeriod && <p className="text-red-500 text-xs mt-1">{errors.lastMenstrualPeriod}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Lab Results (findings + upload, merged) */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">5</span>
              Lab Results
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Abnormal or Notable Lab Findings</label>
              <textarea value={formData.abnormalFindings}
                onChange={(e) => set('abnormalFindings', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="3"
                placeholder="e.g., 'Free T 25 (optimal 18-23), E2 45, TSH 3.1, ferritin 30' OR 'all within optimal ranges'" />
              <p className="text-xs text-gray-600 mt-2">Highlight what stands out - don't just say 'see attached'. This helps focus the review.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lab Results &amp; Supporting Documents <span className="text-red-500">*</span>
              </label>
              <label className="block w-full p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                <div className="flex flex-col items-center">
                  <Upload size={32} className="text-blue-500 mb-2" />
                  <p className="font-semibold text-slate-800">Click to upload or drag files here</p>
                  <p className="text-xs text-gray-600">Lab PDF, chart notes, images &middot; PDF, JPG, PNG</p>
                </div>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </label>

              {formData.files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Files added:</p>
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <button type="button" onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.labsAttached && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  Please add the lab results before submitting.
                </div>
              )}

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Important:</strong> When the email opens, please also drag-and-drop the lab PDF directly into it before sending. Files added here are listed in the email so Dr. Wilcox knows what to expect, but your email program won't attach them automatically.</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <p className="font-semibold mb-2">Ready to submit?</p>
              <p>The next screen will open a pre-filled email to Dr. Wilcox at <strong>darrell2@4everyoungkingwoodtx.com</strong> and remind you to attach the lab file. He typically responds within 24 business hours.</p>
            </div>

            {Object.keys(errors).length > 0 && (
              <div data-error="true" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <p className="font-semibold mb-2 flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  Please complete the following before submitting:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.keys(errors).map(key => (
                    <li key={key}>{errorLabels[key] || key}</li>
                  ))}
                </ul>
              </div>
            )}

            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center">
              <Send size={20} className="mr-2" />
              Prepare Email to Dr. Wilcox
            </button>

            <p className="text-xs text-gray-600 mt-4 text-center">
              By submitting, you confirm that all information provided is accurate and complete to the best of your knowledge.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
