import axios from 'axios';
import authService from './authService';

//http://192.168.3.207:8000
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api' 
  : 'http://192.168.1.16:8000/api';

// Configuration des headers pour les requêtes authentifiées
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const statsService = {
  // Récupérer les statistiques générales
  getGeneralStats: async (date = 'today', customStartDate = null, customEndDate = null) => {
    try {
      let apiUrl = `${API_BASE}/orders/dashboard/?`;
      
      // Gestion des différents types de filtres de date
      if (date === 'custom' && customStartDate && customEndDate) {
        apiUrl += `start_date=${customStartDate.toISOString().split('T')[0]}&end_date=${customEndDate.toISOString().split('T')[0]}`;
      } else {
        apiUrl += `date=${date}`;
      }
      
      console.log(`getGeneralStats - URL: ${apiUrl}`);
      console.log('Headers:', getAuthHeaders());
      
      const response = await axios.get(apiUrl, getAuthHeaders());
      console.log('Réponse dashboard:', response.data);
      
      const data = response.data;
      
      // Transformer les données pour correspondre au format attendu par le frontend
      return {
        totalOrders: data.order_counts.total,
        ordersInProgress: data.order_counts.in_progress,
        completedOrders: data.order_counts.completed,
        growthRate: 12, // À calculer ultérieurement avec des données historiques
        growthPercentage: {
          totalOrders: 8,  // À calculer ultérieurement avec des données historiques
          ordersInProgress: 3,  // À calculer ultérieurement avec des données historiques
          completedOrders: 15  // À calculer ultérieurement avec des données historiques
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques générales', error);
      throw error;
    }
  },

  // Récupérer les statistiques par statut de commande
  getOrdersByStatus: async (date = 'today', customStartDate = null, customEndDate = null) => {
    try {
      let apiUrl = `${API_BASE}/orders/?`;
      
      // Gestion des différents types de filtres de date
      if (date === 'custom' && customStartDate && customEndDate) {
        apiUrl += `start_date=${customStartDate.toISOString().split('T')[0]}&end_date=${customEndDate.toISOString().split('T')[0]}`;
      } else {
        apiUrl += `date=${date}`;
      }

      console.log(`getOrdersByStatus - URL: ${apiUrl}`);
      // Récupérer toutes les commandes pour pouvoir les compter par statut
      const response = await axios.get(apiUrl, getAuthHeaders());
      const orders = response.data;
      
      console.log(`Récupération de ${orders.length} commandes pour analyse des statuts`);
      
      // Compter les commandes par statut réel
      const statusCounts = {
        CREATED: 0,
        PREPARED: 0,
        CONTROLLED: 0,
        PACKED: 0,
        COMPLETED: 0
      };
      
      // Comptage précis en fonction du statut réel de chaque commande
      orders.forEach(order => {
        if (statusCounts.hasOwnProperty(order.status)) {
          statusCounts[order.status]++;
        }
      });
      
      console.log('Nombre de commandes par statut:', statusCounts);
      
      return [
        { name: 'Créées', value: statusCounts.CREATED || 0 },
        { name: 'Préparées', value: statusCounts.PREPARED || 0 },
        { name: 'Contrôlées', value: statusCounts.CONTROLLED || 0 },
        { name: 'Emballées', value: statusCounts.PACKED || 0 }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques par statut', error);
      throw error;
    }
  },

  // Récupérer les statistiques de temps de traitement par étape
  getProcessingTimeByStep: async () => {
    try {
      // Cette fonction sera implémentée côté backend ultérieurement
      // Pour l'instant, nous retournons des données fictives cohérentes avec notre application
      return [
        { name: 'Jan', preparation: 18, control: 12, packing: 8 },
        { name: 'Fév', preparation: 20, control: 14, packing: 9 },
        { name: 'Mar', preparation: 17, control: 11, packing: 7 },
        { name: 'Avr', preparation: 19, control: 13, packing: 8 },
        { name: 'Mai', preparation: 22, control: 15, packing: 10 },
        { name: 'Juin', preparation: 21, control: 14, packing: 9 },
        { name: 'Juil', preparation: 24, control: 16, packing: 11 },
        { name: 'Août', preparation: 23, control: 15, packing: 10 },
        { name: 'Sep', preparation: 25, control: 17, packing: 12 },
        { name: 'Oct', preparation: 22, control: 15, packing: 10 },
        { name: 'Nov', preparation: 26, control: 18, packing: 13 },
        { name: 'Déc', preparation: 24, control: 16, packing: 11 }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des temps de traitement', error);
      throw error;
    }
  },

  // Récupérer les statistiques de performance des agents
  getAgentPerformance: async (date = 'today') => {
    try {
      const response = await axios.get(`${API_BASE}/orders/dashboard/?date=${date}`, getAuthHeaders());
      const data = response.data;
      
      // Transformer les données des agents pour correspondre au format attendu par le frontend
      return data.agent_stats.map(agent => {
        // Calculer le nombre total de commandes traitées
        const totalProcessed = agent.created_count + agent.prepared_count + 
                              agent.controlled_count + agent.packed_count;
        
        // Calculer le temps moyen (fictif pour l'instant)
        const avgTime = Math.round(15 + (Math.random() * 10));
        
        // Calculer une évaluation basée sur les performances
        // Base: 3.5 étoiles
        const baseRating = 3.5;
        
        // Facteur de performance: +/- 1 étoile basé sur le nombre de commandes traitées
        // Plus l'agent traite de commandes, meilleure est son évaluation
        const performanceFactor = totalProcessed > 0 ? 
          Math.min(1, totalProcessed / 50) : 0;
        
        // Facteur de temps: +/- 0.5 étoile basé sur le temps moyen
        // Plus le temps est court, meilleure est l'évaluation
        const timeFactor = avgTime > 0 ? 
          Math.max(0, 1 - (avgTime / 30)) * 0.1 : 0;
        
        const rating = baseRating + performanceFactor + timeFactor;
        
        return {
          name: agent.first_name && agent.last_name ? 
            `${agent.first_name} ${agent.last_name}` : agent.username,
          ordersProcessed: totalProcessed,
          averageTime: avgTime,
          averageTime: Math.max(0, avgTime), // S'assurer que le temps est toujours positif
          rating: Math.min(5, Math.round(rating * 10) / 10)
        };
      });
      
      // Log des commandes pour débogage
      console.log('Données de commandes pour débogage:');
      orders.slice(0, 3).forEach(order => {
        console.log(`Commande #${order.id} (${order.reference}) - Statut: ${order.status}`);
        console.log(` Préparateur: ${order.preparer_details?.username || 'N/A'} (ID: ${order.preparer || 'N/A'})`);
        console.log(` Contrôleur: ${order.controller_details?.username || 'N/A'} (ID: ${order.controller || 'N/A'})`);
        console.log(` Emballeur: ${order.packer_details?.username || 'N/A'} (ID: ${order.packer || 'N/A'})`);
      });
      
      // Log des performances calculées pour débogage
      console.log('Performances calculées:');
      Object.values(agentsMap).slice(0, 3).forEach(agent => {
        console.log(`Agent: ${agent.name} (ID: ${agent.id})`);
        console.log(` Commandes préparées: ${agent.preparedOrders}`);
        console.log(` Commandes contrôlées: ${agent.controlledOrders}`);
        console.log(` Commandes emballées: ${agent.packedOrders}`);
      });
      
      // Convertir le map en tableau et trier par nombre total de commandes traitées (décroissant)
      const agentPerformance = Object.values(agentsMap)
        .filter(agent => {
          // Garder uniquement les agents qui ont effectivement traité des commandes
          return agent.preparedOrders > 0 || agent.controlledOrders > 0 || agent.packedOrders > 0;
        })
        .map(agent => ({
          ...agent,
          // Ajouter une propriété calculée pour le tri
          totalOrders: agent.preparedOrders + agent.controlledOrders + agent.packedOrders
        }))
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .map(({ totalOrders, ...agent }) => agent); // Supprimer la propriété temporaire totalOrders
      
      console.log(`Performances réelles générées pour ${agentPerformance.length} agents actifs`);
      
      // Si aucun agent n'a été trouvé, retourner un tableau vide plutôt que des données fictives
      return agentPerformance;
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des agents', error);
      throw error;
    }
  },

  // Récupérer les statistiques du nombre de commandes par jour
  getDailySales: async (date = 'today', customStartDate = null, customEndDate = null) => {
    console.log(`getDailySales - Période demandée: [${date}]`);
    if (date === 'custom' && customStartDate && customEndDate) {
      console.log(`Dates personnalisées: ${customStartDate.toISOString().split('T')[0]} au ${customEndDate.toISOString().split('T')[0]}`);
    }
    try {
      // Récupérer toutes les commandes avec le filtre de période spécifié
      let apiUrl = `${API_BASE}/orders/?`;
      
      // Gestion des différents types de filtres de date
      if (date === 'custom' && customStartDate && customEndDate) {
        apiUrl += `start_date=${customStartDate.toISOString().split('T')[0]}&end_date=${customEndDate.toISOString().split('T')[0]}`;
      } else {
        apiUrl += `date=${date}`;
      }
      
      console.log(`getDailySales - URL: ${apiUrl}`);
      const response = await axios.get(apiUrl, getAuthHeaders());
      console.log(`URL avec filtrage de période: ${apiUrl}`);
      const orders = response.data;
      
      console.log(`Récupération de ${orders.length} commandes pour analyse par jour`);
      
      // Définir la période d'analyse en fonction du filtre sélectionné
      const endDate = new Date();
      const startDate = new Date(endDate);
      
      // Ajuster la période selon le paramètre de date
      if (date === 'today') {
        // Pour 'today', afficher uniquement aujourd'hui
        console.log('Filtre: Aujourd\'hui - Affichage du jour actuel uniquement');
        // startDate est déjà égal à endDate (aujourd'hui)
      } else if (date === 'week') {
        // Pour 'week', afficher les 7 derniers jours
        console.log('Filtre: 7 jours - Affichage des 7 derniers jours');
        startDate.setDate(endDate.getDate() - 6); // 7 jours en tout (aujourd'hui inclus)
      } else if (date === 'month') {
        // Pour 'month', afficher les 30 derniers jours
        console.log('Filtre: 1 mois - Affichage des 30 derniers jours');
        startDate.setDate(endDate.getDate() - 29); // 30 jours en tout (aujourd'hui inclus)
      } else {
        // Pour les autres cas (date spécifique), défaut à 7 jours
        startDate.setDate(endDate.getDate() - 6); // 7 jours par défaut
      }
      
      // Générer un tableau avec tous les jours de la période sélectionnée
      const days = [];
      const current = new Date(startDate);
      
      // Définir l'intervalle entre les dates pour l'affichage
      // Toujours définir l'intervalle à 1 pour montrer tous les jours
      const interval = 1;
      const dayDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`Période de ${dayDiff} jours: affichage des dates avec un intervalle de ${interval} jour`);
      
      while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + interval);
      }
      
      // Créer un objet pour compter les commandes par jour et par statut
      const dailyCounts = {};
      
      // Initialiser le compteur pour chaque jour
      days.forEach(day => {
        const dateKey = day.toISOString().split('T')[0]; // Format YYYY-MM-DD
        dailyCounts[dateKey] = {
          total: 0,
          CREATED: 0,
          PREPARED: 0,
          CONTROLLED: 0,
          PACKED: 0
        };
      });
      
      // Compter les commandes par jour et par statut
      orders.forEach(order => {
        // Extraire la date de création (format ISO string)
        const createdDate = order.created_at ? new Date(order.created_at) : null;
        if (!createdDate) return;
        
        const dateKey = createdDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        // Vérifier si la date est dans notre période d'analyse
        if (dailyCounts[dateKey]) {
          dailyCounts[dateKey].total += 1;
          
          // Compter par statut
          if (dailyCounts[dateKey].hasOwnProperty(order.status)) {
            dailyCounts[dateKey][order.status] += 1;
          }
        }
      });
      
      console.log('Nombre de commandes par jour:', dailyCounts);
      
      // Transformer les données pour le format attendu par le graphique
      const ordersByDay = Object.entries(dailyCounts).map(([date, counts]) => {
        // Formater la date pour l'affichage avec un format adapté au type de période
        const dateObj = new Date(date);
        let formattedDate;
        
        if (date === 'month') {
          // Pour la vue mensuelle, inclure le jour et le mois (format court)
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString('fr-FR', { month: 'short' });
          formattedDate = `${day} ${month}`;
          
          // Ajouter l'année si ce n'est pas l'année en cours
          const currentYear = new Date().getFullYear();
          if (dateObj.getFullYear() !== currentYear) {
            formattedDate += ` ${dateObj.getFullYear()}`;
          }
        } else if (date === 'today') {
          // Pour la vue d'aujourd'hui, inclure l'heure
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          formattedDate = `${hours}:${minutes}`;
        } else {
          // Vue par défaut (semaine): jour et mois
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString('fr-FR', { month: 'short' });
          formattedDate = `${day} ${month}`;
        }
        
        return {
          name: formattedDate,  // Date formatée pour l'axe X
          barres: counts.total, // Nombre total de commandes pour les barres
          courbe: counts.total, // Même valeur pour la courbe
          details: `${counts.CREATED} nouvelles, ${counts.PREPARED} préparées, ${counts.CONTROLLED} contrôlées, ${counts.PACKED} emballées`
        };
      }).sort((a, b) => {
        // Trier par date (croissant)
        const dateA = new Date(a.name.split(' ')[0] + ' ' + a.name.split(' ')[1]);
        const dateB = new Date(b.name.split(' ')[0] + ' ' + b.name.split(' ')[1]);
        return dateA - dateB;
      });
      
      console.log('Commandes par jour formatées pour l\'affichage:', ordersByDay);
      
      return ordersByDay;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes mensuelles', error);
      throw error;
    }
  },

  // Récupérer les statistiques de visites du site
  getWebsiteViews: async () => {
    try {
      // Cette fonction sera implémentée côté backend ultérieurement
      // Pour l'instant, nous retournons des données fictives
      return [
        { name: 'Lun', views: 25 },
        { name: 'Mar', views: 35 },
        { name: 'Mer', views: 15 },
        { name: 'Jeu', views: 40 },
        { name: 'Ven', views: 30 },
        { name: 'Sam', views: 10 },
        { name: 'Dim', views: 5 }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des visites du site', error);
      throw error;
    }
  },

  // Récupérer les statistiques de commandes complétées (emballées)
  getCompletedTasks: async (date = 'today', customStartDate = null, customEndDate = null) => {
    console.log(`getCompletedTasks - Période demandée: [${date}]`);
    if (date === 'custom' && customStartDate && customEndDate) {
      console.log(`Dates personnalisées: ${customStartDate.toISOString().split('T')[0]} au ${customEndDate.toISOString().split('T')[0]}`);
    }
    try {
      // Récupérer les commandes du jour ou d'une date spécifique
      let apiUrl = `${API_BASE}/orders/dashboard/?`;
      
      // Gestion des différents types de filtres de date
      if (date === 'custom' && customStartDate && customEndDate) {
        apiUrl += `start_date=${customStartDate.toISOString().split('T')[0]}&end_date=${customEndDate.toISOString().split('T')[0]}`;
      } else {
        apiUrl += `date=${date}`;
      }
      
      console.log(`getCompletedTasks - URL: ${apiUrl}`);
      const response = await axios.get(apiUrl, getAuthHeaders());
      const data = response.data;
      
      // Utiliser les données du dashboard pour créer des statistiques mensuelles
      // Comme nous filtrons par jour, nous allons simuler des données mensuelles
      // basées sur les données du jour
      
      // Créer un objet pour stocker le nombre de commandes emballées par mois
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const currentMonth = new Date().getMonth();
      
      // Générer des données pour les 12 derniers mois basées sur les données du jour
      const monthlyPacked = monthNames.map((name, index) => {
        // Utiliser les données du jour pour le mois actuel
        if (index === currentMonth) {
          return { name, tasks: data.order_counts.completed || 0 };
        }
        
        // Pour les autres mois, générer des données basées sur le mois actuel
        // avec une variation aléatoire pour simuler des tendances
        const baseTasks = data.order_counts.completed || 5;
        const monthFactor = 0.6 + (Math.random() * 0.8); // Entre 0.6 et 1.4
        return { name, tasks: Math.round(baseTasks * monthFactor) };
      });
      
      console.log('Statistiques mensuelles des commandes emballées:', monthlyPacked);
      
      return monthlyPacked;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes emballées', error);
      throw error;
    }
  },

  // Récupérer les statistiques de commandes récentes
  getRecentOrders: async (date = 'today', customStartDate = null, customEndDate = null) => {
    try {
      let apiUrl = `${API_BASE}/orders/?limit=10&`;
      
      // Gestion des différents types de filtres de date
      if (date === 'custom' && customStartDate && customEndDate) {
        apiUrl += `start_date=${customStartDate.toISOString().split('T')[0]}&end_date=${customEndDate.toISOString().split('T')[0]}`;
      } else {
        apiUrl += `date=${date}`;
      }
      
      console.log(`getRecentOrders - URL: ${apiUrl}`);
      // Récupérer les commandes
      const response = await axios.get(apiUrl, getAuthHeaders());
      
      // Ajouter des logs pour déboguer
      console.log('Réponse des commandes récentes:', response.data);
      
      // Trier par date de création (les plus récentes d'abord) et prendre les 7 premières
      const recentOrders = response.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 7)
        .map(order => {
          // Récupérer les détails du créateur de la commande
          const creatorDetails = order.creator_details || {};
          
          // Construire le nom complet de l'agent
          let agentName = 'Agent';
          if (creatorDetails.first_name && creatorDetails.last_name) {
            agentName = `${creatorDetails.first_name} ${creatorDetails.last_name}`;
          } else if (creatorDetails.username) {
            agentName = creatorDetails.username;
          }
          
          return {
            id: order.id,
            reference: order.reference,
            status: order.status,
            timestamp: order.created_at,
            agent: agentName
          };
        });
      
      console.log('Commandes récentes formatées:', recentOrders);
      
      return recentOrders;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes récentes', error);
      throw error;
    }
  },
  
  // Récupérer les statistiques de performance des agents
  getAgentPerformance: async (date = 'today', customStartDate = null, customEndDate = null) => {
    try {
      let apiUrl = `${API_BASE}/orders/?`;
      
      // Gestion des différents types de filtres de date
      if (date === 'custom' && customStartDate && customEndDate) {
        apiUrl += `start_date=${customStartDate.toISOString().split('T')[0]}&end_date=${customEndDate.toISOString().split('T')[0]}`;
      } else {
        apiUrl += `date=${date}`;
      }
      
      // Récupérer les commandes pour analyser les performances réelles
      const allOrders = await axios.get(apiUrl, getAuthHeaders());
      const orders = allOrders.data;
      
      console.log(`Récupération de ${orders.length} commandes pour analyse des performances réelles`);
      
      // Créer un map pour stocker les performances de chaque agent
      const agentsMap = {};
      
      // Analyser chaque commande pour extraire les agents et leurs actions
      orders.forEach(order => {
        // Récupérer les détails des agents depuis les données de commande
        const agents = [
          { id: order.creator, details: order.creator_details, type: 'creator' },
          { id: order.preparer, details: order.preparer_details, type: 'preparer' },
          { id: order.controller, details: order.controller_details, type: 'controller' },
          { id: order.packer, details: order.packer_details, type: 'packer' }
        ];
        
        // Pour chaque agent impliqué dans la commande
        agents.forEach(agent => {
          if (!agent.id || !agent.details) return;
          
          // Créer ou mettre à jour l'agent dans le map si nécessaire
          if (!agentsMap[agent.id]) {
            const fullName = agent.details.first_name && agent.details.last_name
              ? `${agent.details.first_name} ${agent.details.last_name}`
              : agent.details.username;
              
            // Ajouter un log pour déboguer le format des noms d'agents
            console.log('Format du nom d\'agent:', {
              id: agent.id,
              firstName: agent.details.first_name,
              lastName: agent.details.last_name,
              fullName,
              username: agent.details.username
            });
              
            agentsMap[agent.id] = {
              id: agent.id,
              name: fullName || `Agent ${agent.id}`,
              username: agent.details.username || `agent${agent.id}`,
              role: agent.details.role || 'AGENT',
              preparedOrders: 0,
              controlledOrders: 0,
              packedOrders: 0,
              // Le nombre de lignes moyen est estimé à partir des données réelles
              avgLinesPerOrder: order.line_count || 5
            };
          }
          
          // Mettre à jour les compteurs en fonction du rôle de l'agent dans cette commande
          // Si l'agent est un préparateur et que la commande a été préparée
          if (agent.type === 'preparer' && order.preparer === agent.id && order.prepared_at) {
            agentsMap[agent.id].preparedOrders += 1;
          }
          
          // Si l'agent est un contrôleur et que la commande a été contrôlée
          if (agent.type === 'controller' && order.controller === agent.id && order.controlled_at) {
            agentsMap[agent.id].controlledOrders += 1;
          }
          
          // Si l'agent est un emballeur et que la commande a été emballée
          if (agent.type === 'packer' && order.packer === agent.id && order.packed_at) {
            agentsMap[agent.id].packedOrders += 1;
          }
        });
      });
      
      // Log des commandes pour débogage
      console.log('Données de commandes pour débogage:');
      orders.slice(0, 3).forEach(order => {
        console.log(`Commande #${order.id} (${order.reference}) - Statut: ${order.status}`);
        console.log(` Préparateur: ${order.preparer_details?.username || 'N/A'} (ID: ${order.preparer || 'N/A'})`);
        console.log(` Contrôleur: ${order.controller_details?.username || 'N/A'} (ID: ${order.controller || 'N/A'})`);
        console.log(` Emballeur: ${order.packer_details?.username || 'N/A'} (ID: ${order.packer || 'N/A'})`);
      });
      
      // Log des performances calculées pour débogage
      console.log('Performances calculées:');
      Object.values(agentsMap).slice(0, 3).forEach(agent => {
        console.log(`Agent: ${agent.name} (ID: ${agent.id})`);
        console.log(` Commandes préparées: ${agent.preparedOrders}`);
        console.log(` Commandes contrôlées: ${agent.controlledOrders}`);
        console.log(` Commandes emballées: ${agent.packedOrders}`);
      });
      
      // Convertir le map en tableau et trier par nombre total de commandes traitées (décroissant)
      const agentPerformance = Object.values(agentsMap)
        .filter(agent => {
          // Garder uniquement les agents qui ont effectivement traité des commandes
          return agent.preparedOrders > 0 || agent.controlledOrders > 0 || agent.packedOrders > 0;
        })
        .map(agent => ({
          ...agent,
          // Ajouter une propriété calculée pour le tri
          totalOrders: agent.preparedOrders + agent.controlledOrders + agent.packedOrders
        }))
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .map(({ totalOrders, ...agent }) => agent); // Supprimer la propriété temporaire totalOrders
      
      console.log(`Performances réelles générées pour ${agentPerformance.length} agents actifs`);
      
      // Si aucun agent n'a été trouvé, retourner un tableau vide plutôt que des données fictives
      return agentPerformance;
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des agents', error);
      throw error;
    }
  },

  // Récupérer toutes les statistiques du tableau de bord pour les analyses avancées
  getDashboardStats: async (queryParams = '') => {
    try {
      const url = queryParams 
        ? `${API_BASE}/orders/dashboard/?${queryParams}` 
        : `${API_BASE}/orders/dashboard/`;
      
      console.log('URL dashboard stats:', url);
      const response = await axios.get(url, getAuthHeaders());
      console.log('Réponse dashboard stats:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du tableau de bord', error);
      throw error;
    }
  }
};

export default statsService;
