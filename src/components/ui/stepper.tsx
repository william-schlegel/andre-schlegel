import type { KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';

type Step = {
  id: number;
  label: string;
  tooltip: string;
};

type StepperProps = {
  steps: Step[];
  activeStep: number;
  onStepClick: (step: number) => void;
};

export function Stepper({ steps, activeStep, onStepClick }: StepperProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = Math.min(steps.length - 1, Math.max(0, activeStep + direction));
    onStepClick(next);
  };

  return (
    <div className="stepper-root" role="tablist" aria-label="Navigation des contenus" onKeyDown={onKeyDown}>
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        const isDone = step.id < activeStep;
        return (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${step.label}. ${step.tooltip}`}
            className={cn('stepper-item', isActive && 'is-active', isDone && 'is-done')}
            onClick={() => onStepClick(step.id)}
          >
            <span className="stepper-item-label">{step.label}</span>
            <span className="stepper-tooltip" role="tooltip">{step.tooltip}</span>
          </button>
        );
      })}
    </div>
  );
}
