import React, { useState } from 'react';
import { ChevronDown, Upload, Send, Check, AlertCircle, HelpCircle } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    requestType: 'lab-followup',
    clinicalReason: '',
    estradiolForm: '',
    estradiolDose: '',
    estradiolFrequency: '',
    progesteroneForm: '',
    progesteroneDose: '',
    progesteroneFrequency: '',
    testosteroneForm: '',
    testosteroneDose: '',
    testosteroneFrequency: '',
    otherMeds: '',
    overallStatus: 'stable',
    currentSymptoms: '',
    newSymptoms: '',
    sideEffects: '',
    patientGoals: '',
    reproductiveStatus: '',
    lastMenstrualPeriod: '',
    yearsSinceLMP: '',
    labsAttached: false,
    abnormalFindings: '',
    files: []
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const tooltips = {
    estradiolForm: "Specify: oral, patch, pellet, cream, or other - this affects absorption and dosing",
    testosteroneForm: "Include: injection (specify concentration like 50mg/mL or 200mg/mL), cream, pellet - essential for dose calculations",
    progesteroneForm: "Micronized oral vs synthetic - affects monitoring and symptom response",
    overallStatus: "Has the patient improved, stayed the same, or worsened since last adjustment?",
    currentSymptoms: "List any persistent symptoms: hot flashes, mood changes, sleep issues, erectile dysfunction, brain fog, etc.",
    reproductiveStatus: "Critical for BHRT dosing - menopause status affects the entire treatment approach",
    lastMenstrualPeriod: "Needed to confirm menopausal vs perimenopausal status - affects progesterone requirements",
    abnormalFindings: "Highlight any labs outside optimal ranges or unexpected results"
  };

  const Tooltip = ({ children, text }) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          onClick={() => setShow(!show)}
          className="inline-block ml-1 text-blue-500 hover:text-blue-700"
        >
          <HelpCircle size={16} />
        </button>
        {show && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-blue-50 border border-blue-200 rounded p-2 text-xs text-gray-700 z-10">
            {text}
          </div>
        )}
      </div>
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name required';
    if (!formData.requestType) newErrors.requestType = 'Request type required';
    if (!formData.reproductiveStatus) newErrors.reproductiveStatus = 'Reproductive status required';
    if (formData.reproductiveStatus === 'perimenopausal' && !formData.lastMenstrualPeriod.trim()) {
      newErrors.lastMenstrualPeriod = 'LMP date required for perimenopausal patients';
    }
    if (formData.reproductiveStatus === 'postmenopausal' && !formData.yearsSinceLMP.trim()) {
      newErrors.yearsSinceLMP = 'Years since LMP required for postmenopausal patients';
    }
    if (!formData.currentSymptoms.trim()) newErrors.currentSymptoms = 'Current symptoms status required';
    if (!formData.overallStatus) newErrors.overallStatus = 'Overall status required';
    
    const hasEstradiol = formData.estradiolForm && formData.estradiolDose;
    const hasProgesterone = formData.progesteroneForm && formData.progesteroneDose;
    const hasTestosterone = formData.testosteroneForm && formData.testosteroneDose;
    if (!hasEstradiol && !hasProgesterone && !hasTestosterone && !formData.otherMeds.trim()) {
      newErrors.regimen = 'Must document current HRT regimen or note if patient not on HRT';
    }

    if (!formData.labsAttached) newErrors.labsAttached = 'Lab results must be attached';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      const emailBody = generateEmailBody();
      setTimeout(() => {
        window.location.href = `mailto:doctorwilcox@gmail.com?subject=Patient%20Consultation%20Request:%20${encodeURIComponent(formData.patientName)}&body=${encodeURIComponent(emailBody)}`;
      }, 1000);
    }
  };

  const generateEmailBody = () => {
    return `PATIENT CONSULTATION REQUEST

PATIENT INFORMATION:
Name: ${formData.patientName}
ID: ${formData.patientId || '(not provided)'}
Request Type: ${formData.requestType}
Clinical Reason: ${formData.clinicalReason || '(not specified)'}

CURRENT HRT REGIMEN:
Estradiol: ${formData.estradiolForm ? `${formData.estradiolDose} ${formData.estradiolForm}, ${formData.estradiolFrequency}` : 'Not documented'}
Progesterone: ${formData.progesteroneForm ? `${formData.progesteroneDose} ${formData.progesteroneForm}, ${formData.progesteroneFrequency}` : 'Not documented'}
Testosterone: ${formData.testosteroneForm ? `${formData.testosteroneDose} ${formData.testosteroneForm}, ${formData.testosteroneFrequency}` : 'Not documented'}
Other Medications/Supplements: ${formData.otherMeds || 'None documented'}

CLINICAL STATUS:
Overall Status: ${formData.overallStatus}
Current Symptoms: ${formData.currentSymptoms}
New Symptoms: ${formData.newSymptoms || 'None reported'}
Side Effects: ${formData.sideEffects || 'None reported'}
Patient Goals: ${formData.patientGoals || 'Not specified'}

REPRODUCTIVE STATUS:
Status: ${formData.reproductiveStatus}
${formData.reproductiveStatus === 'perimenopausal' ? `Last Menstrual Period: ${formData.lastMenstrualPeriod}` : ''}
${formData.reproductiveStatus === 'postmenopausal' ? `Years Since LMP: ${formData.yearsSinceLMP}` : ''}

LAB FINDINGS:
Abnormal Results: ${formData.abnormalFindings || 'All results within optimal ranges'}

NOTE: Lab results and supporting documents should be uploaded separately or sent to this email.`;
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
              Your email client is opening to send this request to Dr. Wilcox. If it doesn't open, please copy the text below and paste it into an email to <strong>doctorwilcox@gmail.com</strong>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  patientName: '',
                  patientId: '',
                  requestType: 'lab-followup',
                  clinicalReason: '',
                  estradiolForm: '',
                  estradiolDose: '',
                  estradiolFrequency: '',
                  progesteroneForm: '',
                  progesteroneDose: '',
                  progesteroneFrequency: '',
                  testosteroneForm: '',
                  testosteroneDose: '',
                  testosteroneFrequency: '',
                  otherMeds: '',
                  overallStatus: 'stable',
                  currentSymptoms: '',
                  newSymptoms: '',
                  sideEffects: '',
                  patientGoals: '',
                  reproductiveStatus: '',
                  lastMenstrualPeriod: '',
                  yearsSinceLMP: '',
                  labsAttached: false,
                  abnormalFindings: '',
                  files: []
                });
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
          <p className="text-gray-600">4Ever Young Scottsdale</p>
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
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.patientName ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Full name"
                />
                {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Zenoti ID or chart number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestType: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.requestType ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="lab-followup">Lab Follow-up</option>
                  <option value="symptom-change">Symptom Change</option>
                  <option value="new-patient">New Patient</option>
                  <option value="medication-adjustment">Medication Adjustment</option>
                  <option value="other">Other Clinical Question</option>
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
                  placeholder="e.g., 'New labs in, reviewing for adjustment'"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Current HRT Regimen */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">2</span>
              Current HRT Regimen
              <Tooltip text="Be as specific as possible. Include formulation, exact dose, frequency, and route of administration." />
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Document exactly what the patient is currently taking. This is critical for making proper dose adjustments.
            </p>

            {/* Estradiol */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-slate-800 mb-4">Estradiol</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Formulation (Route)</label>
                  <input
                    type="text"
                    value={formData.estradiolForm}
                    onChange={(e) => setFormData(prev => ({ ...prev, estradiolForm: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 'oral', 'patch', 'pellet', 'cream'"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                  <input
                    type="text"
                    value={formData.estradiolDose}
                    onChange={(e) => setFormData(prev => ({ ...prev, estradiolDose: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., '2 mg', '0.1 mg/day', '4 mg pellets'"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                  <input
                    type="text"
                    value={formData.estradiolFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, estradiolFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 'daily', 'BID', 'every 3 months'"
                  />
                </div>
              </div>
            </div>

            {/* Progesterone */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-slate-800 mb-4">Progesterone</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Type</label>
                  <select
                    value={formData.progesteroneForm}
                    onChange={(e) => setFormData(prev => ({ ...prev, progesteroneForm: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="micronized oral">Micronized oral (oral capsule)</option>
                    <option value="synthetic">Synthetic progestin</option>
                    <option value="cream">Cream</option>
                    <option value="compound">Compounded form</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                  <input
                    type="text"
                    value={formData.progesteroneDose}
                    onChange={(e) => setFormData(prev => ({ ...prev, progesteroneDose: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., '100 mg', '200 mg'"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Frequency</label>
                  <input
                    type="text"
                    value={formData.progesteroneFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, progesteroneFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 'daily at bedtime', 'days 15-28'"
                  />
                </div>
              </div>
            </div>

            {/* Testosterone */}
            <div className="bg-amber-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center">
                Testosterone
                <Tooltip text="CRITICAL: Include the exact concentration (e.g., 50mg/mL, 200mg/mL). '20mg testosterone' is ambiguous without knowing the formulation concentration." />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Formulation & Concentration</label>
                  <input
                    type="text"
                    value={formData.testosteroneForm}
                    onChange={(e) => setFormData(prev => ({ ...prev, testosteroneForm: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 'Test Cyp 100mg/mL', 'cream 2%', 'pellets'"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Dose</label>
                  <input
                    type="text"
                    value={formData.testosteroneDose}
                    onChange={(e) => setFormData(prev => ({ ...prev, testosteroneDose: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., '20 units weekly', '50mg daily', '600mg every 10 weeks'"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Route & Frequency</label>
                  <input
                    type="text"
                    value={formData.testosteroneFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, testosteroneFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 'SQ weekly', 'IM biweekly', 'topical daily'"
                  />
                </div>
              </div>
            </div>

            {/* Other Medications */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Other Medications / Supplements
              </label>
              <textarea
                value={formData.otherMeds}
                onChange={(e) => setFormData(prev => ({ ...prev, otherMeds: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="3"
                placeholder="Any other hormonal agents, supplements, or medications relevant to hormone optimization (DHEA, pregnenolone, DIM, thyroid, etc.)"
              />
            </div>

            {errors.regimen && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                {errors.regimen}
              </div>
            )}
          </div>

          {/* Section 3: Clinical Status */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">3</span>
              Clinical Status
              <Tooltip text="These details tell Dr. Wilcox whether the current regimen is working or needs adjustment." />
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Overall Status Since Last Adjustment <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {['improved', 'stable', 'worse'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="radio"
                      name="overallStatus"
                      value={status}
                      checked={formData.overallStatus === status}
                      onChange={(e) => setFormData(prev => ({ ...prev, overallStatus: e.target.value }))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
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
              <textarea
                value={formData.currentSymptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, currentSymptoms: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.currentSymptoms ? 'border-red-500' : 'border-slate-300'
                }`}
                rows="3"
                placeholder="e.g., 'asymptomatic' or 'hot flashes (5-10/day), mild mood changes, good energy, sleep improved'"
              />
              {errors.currentSymptoms && <p className="text-red-500 text-xs mt-1">{errors.currentSymptoms}</p>}
              <p className="text-xs text-gray-600 mt-2">Include what's working and what's not - Dr. Wilcox uses symptoms + labs together to make recommendations.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Symptoms Since Last Visit
              </label>
              <textarea
                value={formData.newSymptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, newSymptoms: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="Any new issues that have emerged - or 'none'"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Side Effects or Tolerability Issues
              </label>
              <textarea
                value={formData.sideEffects}
                onChange={(e) => setFormData(prev => ({ ...prev, sideEffects: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="Any negative effects from current regimen - or 'none reported'"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Patient's Goals or Concerns
              </label>
              <textarea
                value={formData.patientGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, patientGoals: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="2"
                placeholder="What does the patient hope to achieve or what are they concerned about?"
              />
            </div>
          </div>

          {/* Section 4: Reproductive Status */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">4</span>
              Reproductive Status
              <Tooltip text="Critical for BHRT - menopause status fundamentally changes dosing and monitoring decisions." />
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {[
                  { value: 'premenopausal', label: 'Premenopausal (regular or irregular cycles)' },
                  { value: 'perimenopausal', label: 'Perimenopausal (irregular cycles, transitioning)' },
                  { value: 'postmenopausal', label: 'Postmenopausal (no period for 12+ months)' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="reproductiveStatus"
                      value={option.value}
                      checked={formData.reproductiveStatus === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, reproductiveStatus: e.target.value }))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.reproductiveStatus && <p className="text-red-500 text-xs mt-2">{errors.reproductiveStatus}</p>}
            </div>

            {formData.reproductiveStatus === 'perimenopausal' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Most Recent Menstrual Period (Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastMenstrualPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastMenstrualPeriod: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastMenstrualPeriod ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g., '2024-05-15' or 'May 15, 2024'"
                />
                {errors.lastMenstrualPeriod && <p className="text-red-500 text-xs mt-1">{errors.lastMenstrualPeriod}</p>}
              </div>
            )}

            {formData.reproductiveStatus === 'postmenopausal' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Years Since Last Menstrual Period <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.yearsSinceLMP}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsSinceLMP: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.yearsSinceLMP ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g., '8' or '3-5 years'"
                />
                {errors.yearsSinceLMP && <p className="text-red-500 text-xs mt-1">{errors.yearsSinceLMP}</p>}
              </div>
            )}
          </div>

          {/* Section 5: Labs & Findings */}
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
                  <p className="text-sm text-gray-600">PDF or image (required)</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.labsAttached}
                  onChange={(e) => setFormData(prev => ({ ...prev, labsAttached: e.target.checked }))}
                  className="ml-auto w-6 h-6 text-blue-600"
                />
              </label>
              {errors.labsAttached && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  Lab results are required
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Abnormal or Notable Lab Findings <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.abnormalFindings}
                onChange={(e) => setFormData(prev => ({ ...prev, abnormalFindings: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="3"
                placeholder="e.g., 'Free T elevated at 25 (optimal range 18-23), E2 at 45, progesterone low at 3' OR 'All values within Dr. W's optimal ranges'"
              />
              <p className="text-xs text-gray-600 mt-2">Highlight what stands out - don't just say 'see attached'. This helps Dr. Wilcox know what to focus on.</p>
            </div>
          </div>

          {/* Section 6: File Uploads */}
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
                  <p className="text-xs text-gray-600">PDF, JPG, PNG (up to 10MB each)</p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {formData.files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Attached Files:</p>
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <p className="font-semibold mb-2">Ready to submit?</p>
              <p>This form will be sent to Dr. Wilcox at <strong>doctorwilcox@gmail.com</strong> with all information included. He typically responds within 24 business hours.</p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center"
            >
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
