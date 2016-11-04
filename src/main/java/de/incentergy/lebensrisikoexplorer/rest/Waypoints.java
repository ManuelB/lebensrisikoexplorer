package de.incentergy.lebensrisikoexplorer.rest;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@Path("waypoints")
public class Waypoints {

	@PersistenceContext
	EntityManager em;

	@GET
	public Response get() {
		return Response.ok().entity("Hallo Welt").build();
	}
}
