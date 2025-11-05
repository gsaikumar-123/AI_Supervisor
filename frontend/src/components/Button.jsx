const base = 'inline-flex justify-center items-center rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-600',
  secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-600',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500'
}

const sizes = {
  md: 'px-4 py-2',
  sm: 'px-3 py-1.5',
  lg: 'px-5 py-2.5'
}

const Button = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  return (
    <button className={[base, variants[variant], sizes[size], className].join(' ')} {...props} />
  )
}

export default Button
