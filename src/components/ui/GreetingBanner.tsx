import { motion, AnimatePresence } from 'framer-motion';
import { getGreeting } from '@/utils/getGreeting';
import { useUserMeta } from '@/context/UserMetaContext';
import { useSmartLocation } from '@/hooks/useSmartLocation';
import { useWeatherData } from '@/hooks/useWeatherData';

type Props = {
  className?: string;
};

const GreetingBanner: React.FC<Props> = ({ className }) => {
  useSmartLocation();
  
  // Use unified weather hook
  const { current } = useWeatherData({
    lat: -1.2921,
    lon: 36.8219,
    refreshInterval: 300000
  });
  
  const { firstName, farmName, locale, weather } = useUserMeta();
  const greeting = getGreeting({ firstName, farmName, tempC: weather?.tempC, conditionSymbol: weather?.condition }, new Date(), locale);

  return (
    <AnimatePresence>
      <motion.div
        key="greeting"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`bg-primary-600 text-white px-4 py-2 rounded-b-md shadow-lg text-sm md:text-base ${className}`}
      >
        {greeting}
      </motion.div>
    </AnimatePresence>
  );
};

export default GreetingBanner;
