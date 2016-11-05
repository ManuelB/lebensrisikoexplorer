package de.incentergy.lebensrisikoexplorer.rest;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("waypoints")
public class Waypoints {

	private static Logger log = Logger.getLogger(Waypoints.class.getSimpleName());
	
	@PersistenceContext
	EntityManager em;

	/**
	 * Starting jetty\\:
	 * cd /home/manuel/geoserver-2.9.2
	 * java -jar start.jar -Djetty.port=8090
	 * @return
	 */
	@GET
	public Response get() {
		try {
		List<?> rows = em
				.createNativeQuery(
						"select COUNT(*),  date\\:\\:timestamp\\:\\:date, SUM(a.wert) FROM waypoint w LEFT JOIN attributes a ON (w.gemeinde = a.gemeinde AND a.name = 'Unfälle mit Personenschaden je 1000 Einwohner in 2015') WHERE EXTRACT(year FROM date) = 2015 GROUP BY date\\:\\:timestamp\\:\\:date ORDER BY date\\:\\:timestamp\\:\\:date;")
				.getResultList();
			return Response.ok().entity(rows).type(MediaType.APPLICATION_JSON).build();
		} catch(Exception e) {
			log.log(Level.SEVERE, "Problem beim selektieren.", e);
			return Response.serverError().entity(e).build();
		}
	}
}
