import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const { pathname, search } = useLocation();

  return (
    <div key={`${pathname}${search}`} className="page-transition">
      {children}
    </div>
  );
}
