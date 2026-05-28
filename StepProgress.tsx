import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <nav aria-label="Прогресс регистрации" className="mb-8">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                {/* Кружок шага */}
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`
                      flex items-center justify-center size-10 rounded-full border-2 transition-all
                      ${isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : isCurrent
                        ? 'bg-primary-light border-primary text-primary'
                        : 'bg-white border-border text-muted-foreground'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="size-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                </div>

                {/* Название шага */}
                <div className="text-center">
                  <p 
                    className={`
                      transition-colors
                      ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {step.name}
                  </p>
                  <p className="text-muted-foreground hidden sm:block mt-1">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Разделительная линия */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    h-0.5 flex-1 transition-colors mx-2 mt-[-2.5rem]
                    ${isCompleted ? 'bg-primary' : 'bg-border'}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
