import { useState, useEffect, FormEvent, ChangeEvent } from "react";

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  disponibilite: string;
  motivation: string;
  pieceIdentite: File | null;
  certificatBapteme: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function InscriptionVeilleur() {
  const [formData, setFormData] = useState<FormData>({
    nom: "", prenom: "", email: "", telephone: "", adresse: "", disponibilite: "", motivation: "",
    pieceIdentite: null, certificatBapteme: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.nom.trim()) errs.nom = "Le nom est requis.";
    if (!formData.prenom.trim()) errs.prenom = "Le prénom est requis.";
    if (!formData.email.trim()) errs.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Email invalide.";
    if (!formData.telephone.trim()) errs.telephone = "Le téléphone est requis.";
    if (!formData.adresse.trim()) errs.adresse = "L'adresse est requise.";
    if (!formData.disponibilite) errs.disponibilite = "Veuillez sélectionner un créneau.";
    if (!formData.motivation.trim()) errs.motivation = "Veuillez expliquer votre motivation.";
    else if (formData.motivation.trim().length < 30) errs.motivation = "Minimum 30 caractères.";
    if (!formData.pieceIdentite) errs.pieceIdentite = "Pièce d'identité requise.";
    if (!formData.certificatBapteme) errs.certificatBapteme = "Certificat de baptême requis.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>, field: "pieceIdentite" | "certificatBapteme") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { setErrors((p) => ({ ...p, [field]: "Max 10 Mo." })); return; }
      setFormData((p) => ({ ...p, [field]: file }));
      setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ivory pt-20">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-gold-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-night-900 mb-4">Demande envoyée avec succès !</h1>
          <p className="text-night-500 mb-8">Merci {formData.prenom}. Votre candidature de veilleur a bien été transmise. Notre équipe vous contactera pour un entretien.</p>
          <button onClick={() => { setSubmitted(false); setFormData({ nom: "", prenom: "", email: "", telephone: "", adresse: "", disponibilite: "", motivation: "", pieceIdentite: null, certificatBapteme: null }); }}
            className="btn-gold-outline">
            Nouvelle candidature
          </button>
        </div>
      </main>
    );
  }

  const creneaux = [
    "Nuit (00h – 04h)", "Aube (04h – 08h)",
    "Matinée (08h – 12h)", "Après-midi (12h – 16h)",
    "Soirée (16h – 20h)", "Nuit (20h – 00h)",
  ];

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border bg-ivory/50 text-night-900 placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all ${errors[field] ? "border-red-400" : "border-pearl-dark"}`;

  return (
    <main>
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-night-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212,149,30,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs tracking-[0.3em] uppercase">Adoration perpétuelle</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory mt-4 mb-6">Inscription Veilleur</h1>
          <div className="ornament-divider max-w-md mx-auto mb-8"><span className="icon">✦</span></div>
          <p className="text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Les veilleurs sont le cœur de notre sanctuaire. Ils assurent une présence continue devant le Saint-Sacrement,
            jour et nuit, par roulement d'une heure.
          </p>
        </div>
      </section>

      <section className={`py-20 lg:py-28 bg-ivory transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl shadow-night-950/5 border border-pearl p-8 lg:p-12">
            <h2 className="font-serif text-2xl font-semibold text-night-900 mb-2 text-center">Candidature Veilleur</h2>
            <p className="text-night-400 text-sm text-center mb-8">Formulaire sécurisé — vos données sont protégées</p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid sm:grid-cols-2 gap-4">
                {(["nom", "prenom"] as const).map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium text-night-700 mb-2 capitalize">
                      {field === "prenom" ? "Prénom" : "Nom"}
                    </label>
                    <input type="text" id={field} name={field} value={formData[field]} onChange={handleChange}
                      className={inputClass(field)}
                      placeholder={field === "prenom" ? "Votre prénom" : "Votre nom"} />
                    {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-night-700 mb-2">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                    className={inputClass("email")} placeholder="votre@email.fr" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-night-700 mb-2">Téléphone</label>
                  <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange}
                    className={inputClass("telephone")} placeholder="+33 6 12 34 56 78" />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-night-700 mb-2">Adresse complète</label>
                <input type="text" id="adresse" name="adresse" value={formData.adresse} onChange={handleChange}
                  className={inputClass("adresse")} placeholder="N° et rue, code postal, ville" />
                {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
              </div>

              <div>
                <label htmlFor="disponibilite" className="block text-sm font-medium text-night-700 mb-2">Créneau de disponibilité</label>
                <select id="disponibilite" name="disponibilite" value={formData.disponibilite} onChange={handleChange}
                  className={inputClass("disponibilite")}>
                  <option value="">Sélectionnez un créneau</option>
                  {creneaux.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.disponibilite && <p className="text-red-500 text-xs mt-1">{errors.disponibilite}</p>}
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-night-700 mb-2">Lettre de motivation</label>
                <textarea id="motivation" name="motivation" value={formData.motivation} onChange={handleChange} rows={4}
                  className={inputClass("motivation")}
                  placeholder="Expliquez en quelques lignes pourquoi vous souhaitez devenir veilleur..." />
                <p className="text-xs text-night-400 mt-1">{formData.motivation.length} / 30 caractères minimum</p>
                {errors.motivation && <p className="text-red-500 text-xs mt-1">{errors.motivation}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-night-700 mb-2">Pièce d'identité</label>
                  <label className="cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gold-300/50 bg-ivory/50 hover:bg-gold-50/50 transition-colors">
                    <svg className="w-5 h-5 text-gold-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-sm text-night-500 truncate">{formData.pieceIdentite ? formData.pieceIdentite.name : "Choisir un fichier"}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFile(e, "pieceIdentite")} className="hidden" />
                  </label>
                  {errors.pieceIdentite && <p className="text-red-500 text-xs mt-1">{errors.pieceIdentite}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-night-700 mb-2">Certificat de baptême</label>
                  <label className="cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gold-300/50 bg-ivory/50 hover:bg-gold-50/50 transition-colors">
                    <svg className="w-5 h-5 text-gold-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-sm text-night-500 truncate">{formData.certificatBapteme ? formData.certificatBapteme.name : "Choisir un fichier"}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFile(e, "certificatBapteme")} className="hidden" />
                  </label>
                  {errors.certificatBapteme && <p className="text-red-500 text-xs mt-1">{errors.certificatBapteme}</p>}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gold-50 border border-gold-200">
                <p className="text-sm text-gold-800">
                  <strong>Important :</strong> En soumettant cette candidature, vous confirmez être majeur(e), baptisé(e) 
                  dans l'Église catholique et disposé(e) à suivre une formation préalable à l'adoration.
                </p>
              </div>

              <button type="submit" className="w-full btn-primary text-center cursor-pointer">
                Envoyer ma candidature
              </button>
              <p className="text-xs text-night-400 text-center mt-4">
                Vos données sont sécurisées et ne seront jamais partagées.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
