package de.incentergy.lebensrisikoexplorer.rest;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("waypoints")
public class Waypoints {

	@PersistenceContext
	EntityManager em;

	@GET
	public Response get() {

		List<?> rows = em
				.createNativeQuery(
						"select COUNT(*),  date\\:\\:timestamp\\:\\:date FROM waypoint WHERE EXTRACT(year FROM date) = 2015 GROUP BY date\\:\\:timestamp\\:\\:date ORDER BY date\\:\\:timestamp\\:\\:date;")
				.getResultList();

		return Response.ok().entity(rows).type(MediaType.APPLICATION_JSON).build();
	}
}
