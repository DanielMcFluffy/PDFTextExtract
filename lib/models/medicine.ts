export type MedicineName = {
  name: string;
  pronounciation: string;
  type: string;
}

export type PrescriberHighlights = string[];

export type MedicineDetails = 
| 'Uses/Indications'
| 'Pharmacology/Actions'
| 'Pharmacokinetics'
| 'Contraindications/Precautions/Warnings'
| 'Adverse Effects'
| 'Reproductive/Nursing Safety'
| 'Overdosage/Acute Toxicity'
| 'Drug Interactions'
| 'Laboratory Considerations'
| 'Doses'
| 'Monitoring'
| 'Client Information'
| 'Chemistry'
| 'Storage/Stability'
| 'Dosage Forms/Regulatory Status'
| 'References'

export type Medicine = {
  name: MedicineName,
  prescriberHighlights?: PrescriberHighlights,
} & Partial<Record<MedicineDetails, string>>;