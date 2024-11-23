import { analyzeExcelFile } from './excelAnalyzer';

interface FetchError extends Error {
  status?: number;
  type?: string;
}

// Utiliser un proxy CORS plus fiable
const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const BASE_URL = 'https://etrace.cristalcloud.com/MODULES/Covea/livraison_export.php';

export async function fetchAndParseExcel(technicien: string): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const encodedUrl = encodeURIComponent(`${BASE_URL}?statut=&technicien=${technicien}`);
    const url = `${PROXY_URL}${encodedUrl}`;
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Origin': window.location.origin
      },
      signal: controller.signal,
      credentials: 'omit'
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Erreur lors du téléchargement du fichier';
      
      switch (response.status) {
        case 401:
          errorMessage = 'Veuillez vous connecter à eTRACE';
          break;
        case 403:
          errorMessage = 'Accès non autorisé. Veuillez vous reconnecter à eTRACE';
          break;
        case 404:
          errorMessage = 'Fichier non trouvé';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Le serveur eTRACE est temporairement indisponible';
          break;
      }

      const error: FetchError = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const buffer = await response.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('Le fichier téléchargé est vide');
    }

    try {
      const data = analyzeExcelFile(buffer);
      if (!data?.[0]?.data?.length) {
        throw new Error('Le fichier ne contient pas de données valides');
      }
      return data;
    } catch (parseError) {
      console.error('Erreur lors de l\'analyse du fichier:', parseError);
      throw new Error('Le format du fichier n\'est pas valide. Veuillez vérifier que vous êtes connecté à eTRACE.');
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Le téléchargement a pris trop de temps. Veuillez réessayer.');
      }
      
      if ((error as FetchError).type === 'network') {
        throw new Error('Erreur réseau. Veuillez vérifier votre connexion internet.');
      }

      throw error;
    }
    throw new Error('Une erreur inattendue est survenue');
  }
}