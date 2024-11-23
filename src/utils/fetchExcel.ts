import { analyzeExcelFile } from './excelAnalyzer';

interface FetchError extends Error {
  status?: number;
  type?: string;
}

const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://etrace.cristalcloud.com/MODULES/Covea/livraison_export.php';

export async function fetchAndParseExcel(technicien: string): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const url = `${PROXY_URL}${BASE_URL}?statut=&technicien=${encodeURIComponent(technicien)}`;
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: FetchError = new Error(
        response.status === 401 
          ? 'Veuillez vous connecter à eTRACE'
          : response.status === 403
          ? 'Accès non autorisé. Veuillez vous reconnecter.'
          : response.status === 404
          ? 'Fichier non trouvé'
          : response.status >= 500
          ? 'Erreur serveur. Veuillez réessayer plus tard.'
          : 'Erreur lors du téléchargement du fichier'
      );
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('spreadsheet') && !contentType?.includes('octet-stream')) {
      throw new Error('Le format du fichier n\'est pas valide');
    }

    const buffer = await response.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('Le fichier est vide');
    }

    return analyzeExcelFile(buffer);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La requête a pris trop de temps. Veuillez vérifier votre connexion.');
      }
      
      if ((error as FetchError).type === 'network') {
        throw new Error('Erreur réseau. Veuillez vérifier votre connexion internet.');
      }

      // Si l'erreur vient du proxy CORS
      if ((error as FetchError).message.includes('cors-anywhere')) {
        throw new Error('Erreur d\'accès au serveur. Veuillez réessayer plus tard.');
      }

      console.error('Erreur lors de la récupération du fichier:', error);
      throw new Error(error.message || 'Une erreur est survenue lors de la récupération du fichier');
    }
    throw new Error('Une erreur inattendue est survenue');
  }
}