import { useCalculatorStore } from '@/store/calculator-store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import OverviewTab from '@/components/tabs/OverviewTab';
import MonteCarloTab from '@/components/tabs/MonteCarloTab';
import SensitivityTab from '@/components/tabs/SensitivityTab';
import EarlyExitTab from '@/components/tabs/EarlyExitTab';
import CostDetailTab from '@/components/tabs/CostDetailTab';
import TaxSalaryTab from '@/components/tabs/TaxSalaryTab';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'monte-carlo', label: 'Monte Carlo' },
  { value: 'sensitivity', label: 'Sensitivity' },
  { value: 'early-exit', label: 'Early Exit' },
  { value: 'cost-details', label: 'Cost Details' },
  { value: 'tax-salary', label: 'Tax & Salary' },
] as const;

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  'overview': OverviewTab,
  'monte-carlo': MonteCarloTab,
  'sensitivity': SensitivityTab,
  'early-exit': EarlyExitTab,
  'cost-details': CostDetailTab,
  'tax-salary': TaxSalaryTab,
};

const tabMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export function TabNav() {
  const activeTab = useCalculatorStore((s) => s.activeTab);
  const setActiveTab = useCalculatorStore((s) => s.setActiveTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList
        variant="line"
        className="h-10 w-full justify-start gap-0 border-b border-white/[0.06] bg-transparent px-0"
      >
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-10 rounded-none border-b-0 px-4 text-xs font-medium tracking-wide text-gray-500 transition-colors hover:text-gray-300 data-active:text-amber-400 data-active:after:bg-amber-500"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => {
        const Component = TAB_COMPONENTS[tab.value];
        return (
          <TabsContent key={tab.value} value={tab.value}>
            <AnimatePresence mode="wait">
              <motion.div key={tab.value} {...tabMotion} className="pt-4 pb-8">
                <Component />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export { TabsContent };
export { TABS };
