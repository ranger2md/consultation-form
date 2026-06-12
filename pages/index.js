import React, { useState } from 'react';
import { Upload, Send, Check, AlertCircle, HelpCircle } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    requestType: 'existing-followup',
    clinicalReason: '',
    testosteroneForm: '',
    testosteroneDose: '',
    testosteroneFrequency: '',
    testosteroneLastDose: '',
    progesteroneForm: '',
    progesteroneDose: '',
    progesteroneFrequency: '',
    progesteroneLastDose: '',
    estradiolForm: '',
    estradiolDose: '',
    estradiolFrequency: '',
    estradiolLastDose: '',
    thyroidForm: '',
    thyroidDose: '',
    thyroidFrequency: '',
    thyroidLastDose: '',
    otherMeds: '',
    overallStatus: 'stable',
    currentSymptoms: '',
    newSymptoms: '',
    sideEffects: '',
    patientGoals: '',
    isMenopausal: '',
    menoNoMenses: false,
    menoFSH: false,
    menoLH: false,
    menoEstradiol: false,
    menoAge: false,
    cycleRegularity: '',
    lastMenstrualPeriod: '',
    labsAttached: false,
    abnormalFindings: '',
    files: []
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const isExisting = formData.requestType === 'existing-followup';

  const Tooltip = ({ text }) => {
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
          <div className="absolute bottom-full left-0 mb-2 w-56 bg-blue-50 border border-blue-200 rounded p-2 text-xs text-gray-700 z-10">
            {text}
          </div>
        )}
      </div>
    );
  };

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
      const hasTestosterone = formData.testosteroneForm && formData.testosteroneDose;
      const hasProgesterone = formData.progesteroneForm && formData.progesteroneDose;
      const hasEstradiol = formData.estradiolForm && formData.estradiolDose;
      const hasThyroid = formData.thyroidForm && formData.thyroidDose;
      if (!hasTestosterone && !hasProgesterone && !hasEstradiol && !hasThyroid && !formData.otherMeds.trim()) {
        newErrors.regimen = 'Must document current regimen for an existing patient follow-up';
      }
    }

    if (!formData.labsAttached) newErrors.labsAttached = 'Lab results must be attached';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      const emailBody = generateEmailBody();
      setTimeout(() => {
        window.location.href = `mailto:darrell2@4everyoungkingwoodtx.com?subject=Consultation%20Request:%20${encodeURIComponent(formData.patientName)}&body=${encodeURIComponent(emailBody)}`;
      }, 1000);
    }
  };

  const hormoneLine = (label, form, dose, freq, lastDose) => {
    if (!form && !dose) return `${label}: Not documented`;
    let line = `${label}: ${dose} ${form}, ${freq}`;
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

    return `CONSULTATION REQUEST - PRECISION HORMONE CONSULTING

REQUEST TYPE: ${formData.requestType === 'new-patient' ? 'NEW PATIENT - Full BHRT Analysis' : 'EXISTING BHRT PATIENT - Follow-up'}

PATIENT INFORMATION:
Name: ${formData.patientName}
Age: ${formData.patientAge}
Clinical Reason: ${formData.clinicalReason || '(not specified)'}

${isExisting ? `CURRENT REGIMEN:
${hormoneLine('Testosterone', formData.testosteroneForm, formData.testosteroneDose, formData.testosteroneFrequency, formData.testosteroneLastDose)}
${hormoneLine('Progesterone', formData.progesteroneForm, formData.progesteroneDose, formData.progesteroneFrequency, formData.progesteroneLastDose)}
${hormoneLine('Estradiol', formData.estradiolForm, formData.estradiolDose, formData.estradiolFrequency, formData.estradiolLastDose)}
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

NOTE: Lab results and supporting documents attached or sent to this email.`;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <Check size={64} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted</h2>
            <p className="text-gray-600 mb-4">
              Your consultation request for <strong>{formData.patientName}</strong> has been prepared.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Your email client is opening to send this request to Dr. Wilcox. If it doesn't open, please copy the information into an email to <strong>darrell2@4everyoungkingwoodtx.com</strong> and attach the labs.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setErrors({});
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Another Request
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
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.patientName ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Full name"
                />
                {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Patient Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.patientAge}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.patientAge ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="e.g., 54"
                />
                {errors.patientAge && <p className="text-red-500 text-xs mt-1">{errors.patientAge}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestType: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requestType ? 'border-red-500' : 'border-slate-300'}`}
                >
                  <option value="existing-followup">Existing BHRT Patient - Follow-up</option>
                  <option value="new-patient">New Patient - Full BHRT Analysis</option>
                </select>
                {errors.requestType && <p className="text-red-500 text-xs mt-1">{errors.requestType}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Clinical Reason for Request
                </label>
                <input
                  type="text"
                  value={formData.clinicalReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinicalReason: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 'Follow-up labs in, reviewing for adjustment'"
                />
              </div>
            </div>
          </div>

          {isExisting && (
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">2</span>
                Current Regimen
                <Tooltip text="Be specific: include formulation, exact dose, frequency, route. For existing patients, the last dose date/time before labs tells us whether we're seeing peak, trough, or mid-range levels." />
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Document exactly what the patient is currently taking, and when each was last dosed prior to the blood draw.
              </p>

              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                  Testosterone
                  <Tooltip text="CRITICAL: Include exact concentration (e.g., 50mg/mL, 100mg/mL, 200mg/mL). '20 units' means nothing without the concentration. Note route (SQ/IM/topical)." />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Formulation & Concentration</label>
                    <input type="text" value={formData.testosteroneForm}
                      onChange={(e) => setFormData(prev => ({ ...prev, testosteroneForm: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'Test Cyp 100mg/mL', 'cream 2%', 'pellet'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                    <input type="text" value={formData.testosteroneDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, testosteroneDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '20 units', '50mg', '600mg pellets'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Route & Frequency</label>
                    <input type="text" value={formData.testosteroneFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, testosteroneFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'SQ weekly', 'IM q2wk', 'topical daily'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.testosteroneLastDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, testosteroneLastDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '3 days prior', '6/5 8am'" />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Progesterone</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Type</label>
                    <select value={formData.progesteroneForm}
                      onChange={(e) => setFormData(prev => ({ ...prev, progesteroneForm: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="micronized oral">Micronized oral (capsule)</option>
                      <option value="synthetic progestin">Synthetic progestin</option>
                      <option value="cream">Cream</option>
                      <option value="compounded">Compounded form</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                    <input type="text" value={formData.progesteroneDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, progesteroneDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '100 mg', '200 mg'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                    <input type="text" value={formData.progesteroneFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, progesteroneFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'qHS', 'days 15-28'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.progesteroneLastDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, progesteroneLastDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'last night', '6/5 10pm'" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Estradiol</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Formulation (Route)</label>
                    <input type="text" value={formData.estradiolForm}
                      onChange={(e) => setFormData(prev => ({ ...prev, estradiolForm: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'oral', 'patch', 'pellet', 'cream'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                    <input type="text" value={formData.estradiolDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, estradiolDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '2 mg', '0.1 mg/day', '4mg pellet'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                    <input type="text" value={formData.estradiolFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, estradiolFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'daily', 'BID', 'q3 months'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.estradiolLastDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, estradiolLastDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'morning of', '6/5 7am'" />
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                  Thyroid
                  <Tooltip text="Include agent (NP Thyroid, levothyroxine, liothyronine, compounded T3/T4), dose, and timing. Last-dose timing matters especially for T3-containing products." />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Agent / Formulation</label>
                    <input type="text" value={formData.thyroidForm}
                      onChange={(e) => setFormData(prev => ({ ...prev, thyroidForm: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'NP Thyroid', 'levothyroxine', 'compounded T3/T4'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                    <input type="text" value={formData.thyroidDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, thyroidDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., '60 mg', '88 mcg'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                    <input type="text" value={formData.thyroidFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, thyroidFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'daily AM', 'BID'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Last dose before labs (date/time)</label>
                    <input type="text" value={formData.thyroidLastDose}
                      onChange={(e) => setFormData(prev => ({ ...prev, thyroidLastDose: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'held AM of draw', '6/5 6am'" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Other Medications / Supplements
                </label>
                <textarea value={formData.otherMeds}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherMeds: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, otherMeds: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="4"
                placeholder="Any current prescriptions, OTC hormones, thyroid medication, supplements, etc. - or 'none'" />
            </div>
          )}

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
                      onChange={(e) => setFormData(prev => ({ ...prev, overallStatus: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, currentSymptoms: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.currentSymptoms ? 'border-red-500' : 'border-slate-300'}`}
                rows="3"
                placeholder="e.g., 'asymptomatic' or 'hot flashes 5-10/day, low libido, fatigue, sleep improved'" />
              {errors.currentSymptoms && <p className="text-red-500 text-xs mt-1">{errors.currentSymptoms}</p>}
              <p className="text-xs text-gray-600 mt-2">Include what's working and what's not - symptoms + labs together drive the recommendation.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Symptoms Since Last Visit</label>
              <textarea value={formData.newSymptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, newSymptoms: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="Any new issues that have emerged - or 'none'" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Side Effects or Tolerability Issues</label>
              <textarea value={formData.sideEffects}
                onChange={(e) => setFormData(prev => ({ ...prev, sideEffects: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="Any negative effects from current regimen - or 'none reported'" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Patient's Goals or Concerns</label>
              <textarea value={formData.patientGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, patientGoals: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="What does the patient hope to achieve or what are they concerned about?" />
            </div>
          </div>

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
                      onChange={(e) => setFormData(prev => ({ ...prev, isMenopausal: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
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
                          onChange={(e) => setFormData(prev => ({ ...prev, cycleRegularity: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, lastMenstrualPeriod: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastMenstrualPeriod ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="e.g., '2026-05-28' or 'May 28'" />
                  {errors.lastMenstrualPeriod && <p className="text-red-500 text-xs mt-1">{errors.lastMenstrualPeriod}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">5</span>
              Lab Results & Findings
            </h2>

            <div className="mb-6">
              <label className="flex items-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                <Upload size={24} className="text-slate-600 mr-3" />
                <div>
                  <p className="font-semibold text-slate-800">Lab Results Attached</p>
                  <p className="text-sm text-gray-600">Confirm labs are uploaded below or attached to the email (required)</p>
                </div>
                <input type="checkbox" checked={formData.labsAttached}
                  onChange={(e) => setFormData(prev => ({ ...prev, labsAttached: e.target.checked }))}
                  className="ml-auto w-6 h-6 text-blue-600" />
              </label>
              {errors.labsAttached && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  Lab results are required
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Abnormal or Notable Lab Findings</label>
              <textarea value={formData.abnormalFindings}
                onChange={(e) => setFormData(prev => ({ ...prev, abnormalFindings: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="3"
                placeholder="e.g., 'Free T 25 (optimal 18-23), E2 45, TSH 3.1, ferritin 30' OR 'all within optimal ranges'" />
              <p className="text-xs text-gray-600 mt-2">Highlight what stands out - don't just say 'see attached'. This helps focus the review.</p>
            </div>
          </div>

          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">6</span>
              Supporting Documents
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Upload Lab Results, Chart Notes, or Other Supporting Documents
              </label>
              <label className="block w-full p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                <div className="flex flex-col items-center">
                  <Upload size={32} className="text-blue-500 mb-2" />
                  <p className="font-semibold text-slate-800">Click to upload or drag files here</p>
                  <p className="text-xs text-gray-600">PDF, JPG, PNG</p>
                </div>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </label>

              {formData.files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Attached Files:</p>
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
              <p className="text-xs text-gray-600 mt-3">
                Note: If your email client doesn't carry these attachments over automatically, please attach the lab PDF directly to the email that opens.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <p className="font-semibold mb-2">Ready to submit?</p>
              <p>This will be sent to Dr. Wilcox at <strong>darrell2@4everyoungkingwoodtx.com</strong> with all information included. He typically responds within 24 business hours.</p>
            </div>

            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center">
              <Send size={20} className="mr-2" />
              Submit Consultation Request
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
