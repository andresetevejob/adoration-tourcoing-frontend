import { useState, useEffect, FormEvent, ChangeEvent } from "react";

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  confirmation: string;
  photo: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function InscriptionLecteur() {
  const [formData, setFormData] = useState<FormData>({
    nom: "", prenom: "", email: "", telephone: "", motDePasse: "", confirmation: "", photo: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.nom.trim()) errs.nom = "Le nom est requis.";
    if (!formData.prenom.trim()) errs.prenom = "Le prénom est requis.";
    if (!formData.email.trim()) errs.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Email invalide.";
    if (!formData.telephone.trim()) errs.telephone = "Le téléphone est requis.";
    else if (!/^[+\d\s]{10,}$/.test(formData.telephone.trim())) errs.telephone = "Numéro invalide (min 10 chiffres).";
    if (!formData.motDePasse) errs.motDePasse = "Le mot de passe est requis.";
    else if (formData.motDePasse.length < 8) errs.motDePasse = "Min 8 caractères.";
    if (formData.motDePasse !== formData.confirmation) errs.confirmation = "Les mots de passe ne correspondent pas.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setErrors((p) => ({ ...p, photo: "Max 5 Mo." })); return; }
      setFormData((p) => ({ ...p, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
      setErrors((p) => { const n = { ...p }; delete n.photo; return n; });
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
          <h1 className="font-serif text-3xl font-bold text-night-900 mb-4">Inscription réussie !</h1>
          <p className="text-night-500 mb-8">Merci {formData.prenom}. Votre demande a bien été enregistrée.</p>
          <button onClick={() => { setSubmitted(false); setFormData({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", confirmation: "", photo: null }); setPhotoPreview(null); }}
            className="btn-gold-outline">
            Nouvelle inscription
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-night-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212,149,30,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs tracking-[0.3em] uppercase">Engagement</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory mt-4 mb-6">Inscription Lecteur</h1>
          <div className="ornament-divider max-w-md mx-auto mb-8"><span className="icon">✦</span></div>
          <p className="text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Les lecteurs proclament la Parole de Dieu lors des célébrations. Un ministère essentiel au service de la liturgie.
          </p>
        </div>
      </section>

      <section className={`py-20 lg:py-28 bg-ivory transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl shadow-night-950/5 border border-pearl p-8 lg:p-12">
            <h2 className="font-serif text-2xl font-semibold text-night-900 mb-8 text-center">Formulaire d'inscription</h2>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label className="block text-sm font-medium text-night-700 mb-2">Photo de profil</label>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-pearl flex items-center justify-center overflow-hidden border-2 border-dashed border-gold-300/50">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-night-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer inline-block px-4 py-2 text-sm font-medium text-gold-600 border border-gold-300 rounded-full hover:bg-gold-50 transition-colors">
                      Choisir une photo
                      <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    </label>
                    <p className="text-xs text-night-400 mt-1">JPG ou PNG, 5 Mo max</p>
                  </div>
                </div>
                {errors.photo && <p className="text-red-500 text-xs mt-2">{errors.photo}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {(["nom", "prenom"] as const).map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium text-night-700 mb-2 capitalize">
                      {field === "prenom" ? "Prénom" : "Nom"}
                    </label>
                    <input type="text" id={field} name={field} value={formData[field]} onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border bg-ivory/50 text-night-900 placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all ${errors[field] ? "border-red-400" : "border-pearl-dark"}`}
                      placeholder={field === "prenom" ? "Votre prénom" : "Votre nom"} />
                    {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-night-700 mb-2">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border bg-ivory/50 text-night-900 placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all ${errors.email ? "border-red-400" : "border-pearl-dark"}`}
                  placeholder="votre@email.fr" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-night-700 mb-2">Téléphone</label>
                <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border bg-ivory/50 text-night-900 placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all ${errors.telephone ? "border-red-400" : "border-pearl-dark"}`}
                  placeholder="+33 6 12 34 56 78" />
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-medium text-night-700 mb-2">Mot de passe</label>
                  <input type="password" id="motDePasse" name="motDePasse" value={formData.motDePasse} onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-ivory/50 text-night-900 placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all ${errors.motDePasse ? "border-red-400" : "border-pearl-dark"}`}
                    placeholder="Min. 8 caractères" />
                  {errors.motDePasse && <p className="text-red-500 text-xs mt-1">{errors.motDePasse}</p>}
                </div>
                <div>
                  <label htmlFor="confirmation" className="block text-sm font-medium text-night-700 mb-2">Confirmation</label>
                  <input type="password" id="confirmation" name="confirmation" value={formData.confirmation} onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-ivory/50 text-night-900 placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all ${errors.confirmation ? "border-red-400" : "border-pearl-dark"}`}
                    placeholder="Confirmez le mot de passe" />
                  {errors.confirmation && <p className="text-red-500 text-xs mt-1">{errors.confirmation}</p>}
                </div>
              </div>

              <button type="submit" className="w-full btn-primary text-center cursor-pointer">
                S'inscrire comme lecteur
              </button>
              <p className="text-xs text-night-400 text-center mt-4">
                En vous inscrivant, vous acceptez notre politique de confidentialité.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
