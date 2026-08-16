FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY CollaborativeDashboard.Api.csproj .
RUN dotnet restore
COPY . .
RUN dotnet restore Tests/CollaborativeDashboard.Api.Tests.csproj
RUN dotnet test Tests/CollaborativeDashboard.Api.Tests.csproj --no-restore
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5003
ENTRYPOINT ["dotnet", "CollaborativeDashboard.Api.dll"]
