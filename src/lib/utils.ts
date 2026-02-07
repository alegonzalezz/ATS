import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // In a real app, we would use a PDF parsing library
      // For now, we'll return a placeholder with the file name
      resolve(`Contenido extraído de ${file.name}`);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Presente';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    nuevo: 'bg-blue-100 text-blue-800 border-blue-200',
    en_revision: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    entrevista: 'bg-purple-100 text-purple-800 border-purple-200',
    oferta: 'bg-orange-100 text-orange-800 border-orange-200',
    contratado: 'bg-green-100 text-green-800 border-green-200',
    rechazado: 'bg-red-100 text-red-800 border-red-200',
    archivado: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    nuevo: 'Nuevo',
    en_revision: 'En Revisión',
    entrevista: 'Entrevista',
    oferta: 'Oferta',
    contratado: 'Contratado',
    rechazado: 'Rechazado',
    archivado: 'Archivado',
  };
  return labels[status] || status;
}

export function getSourceIcon(source: string): string {
  const icons: Record<string, string> = {
    cv: '📄',
    linkedin: '💼',
    manual: '✏️',
  };
  return icons[source] || '📋';
}
