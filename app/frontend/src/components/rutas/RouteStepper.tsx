import React from 'react';

interface RouteStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export const RouteStepper: React.FC<RouteStepperProps> = ({
  currentStep,
  onStepChange,
}) => {
  const steps = [
    {
      number: 1,
      title: 'Información de la ruta',
      subtitle: 'Configura los datos generales',
    },
    {
      number: 2,
      title: 'Diseño de la ruta',
      subtitle: 'Agrega clientes y ordena las paradas',
    },
    {
      number: 3,
      title: 'Asignación',
      subtitle: 'Asigna la ruta a un asesor',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s) => {
          const isActive = currentStep === s.number;
          const isPassed = currentStep > s.number;

          return (
            <div
              key={s.number}
              onClick={() => onStepChange(s.number)}
              className={`flex items-center gap-3.5 p-2 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? 'border-b-2 md:border-b-0 md:border-l-4 border-[#0F172A] bg-slate-50/70'
                  : 'hover:bg-slate-50 opacity-80'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-[#0F172A] text-white ring-2 ring-[#0F172A]/20'
                    : isPassed
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-slate-200 text-slate-700'
                }`}
              >
                {s.number}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-tight ${
                    isActive ? 'text-[#0F172A]' : 'text-slate-700'
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight truncate">
                  {s.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
