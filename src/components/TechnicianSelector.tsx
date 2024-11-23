import React from 'react';
import { Users, User, AlertTriangle, ExternalLink } from 'lucide-react';

export const TECHNICIANS = [
  { id: '', name: 'Tous les techniciens', icon: Users },
  { id: 'Aubry', name: 'Aubry Etienne', icon: User },
  { id: 'Marzat', name: 'Marzat Romain', icon: User },
  { id: 'Delanoe', name: 'Delanoe Sonia', icon: User },
  { id: 'Perez', name: 'Perez Anthony', icon: User },
  { id: 'Albert', name: 'Albert Alexis', icon: User },
  { id: 'Lecomte', name: 'Lecomte Vincent', icon: User }
];

interface TechnicianSelectorProps {
  onSelect: (techId: string) => void;
  loading: boolean;
  progress: number;
}

export function TechnicianSelector({ onSelect, loading, progress }: TechnicianSelectorProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-4">
        Sélectionnez votre profil
      </h2>
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-300 px-4 py-2 rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">
            Pour accéder aux données, veuillez d'abord vous connecter à{' '}
            <a 
              href="https://etrace.cristalcloud.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 underline hover:text-amber-200"
            >
              <span>eTRACE</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TECHNICIANS.map(tech => {
          const Icon = tech.icon;
          return (
            <button
              key={tech.id}
              onClick={() => onSelect(tech.id)}
              disabled={loading}
              className={`relative p-6 rounded-xl border border-white/10 transition-all duration-300
                ${loading 
                  ? 'bg-slate-800/50 cursor-not-allowed' 
                  : 'bg-slate-800/50 hover:bg-slate-700/50 hover:scale-105 hover:shadow-lg'}`}
            >
              {loading && (
                <div className="absolute inset-0 bg-violet-500/10 rounded-xl overflow-hidden">
                  <div 
                    className="h-1 bg-violet-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3">
                <Icon className="h-8 w-8 text-violet-400" />
                <span className="text-white font-medium">{tech.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400">
        <p>
          Si vous ne parvenez pas à charger les données, vous pouvez{' '}
          <a 
            href={`https://etrace.cristalcloud.com/MODULES/Covea/livraison_export.php?statut=`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            télécharger le fichier manuellement
          </a>
          {' '}et l'importer ici.
        </p>
      </div>
    </div>
  );
}