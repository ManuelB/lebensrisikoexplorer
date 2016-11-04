package de.incentergy.lebensrisikoexplorer;

import javax.annotation.sql.DataSourceDefinition;
import javax.ejb.Singleton;
import javax.ejb.Startup;

@Singleton
@Startup
// AOCL-3659 - isolationLevel=Connection.TRANSACTION_READ_UNCOMMITTED does
// not make a difference
// properties={"loglevel=2"} does not do anything
// jdbc:postgresql://localhost:5432/aocloud?loglevel=2 does not do anything
// https://java.net/jira/browse/JAVAEE_SPEC-30
// https://javaee-spec.java.net/nonav/javadocs/javax/annotation/sql/DataSourceDefinition.html
// https://jdbc.postgresql.org/documentation/94/ds-ds.html
@DataSourceDefinition(name = "java:global/PostgresSQL", className = "org.postgresql.ds.PGPoolingDataSource", serverName = "localhost", portNumber = 5432, databaseName = "postgis-benchmark", user = "lebensrisikoexplorer", password = "secret")
public class Bootstraper {

}
